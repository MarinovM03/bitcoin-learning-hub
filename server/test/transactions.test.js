import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import { app } from './helpers.js';
import { resetTransactionCache } from '../controllers/transactionController.js';

const TXID = 'a1075db55d416d3ca199f55b6084e2115b9345e16c5cf302fc80e9d5fbf5d48d';

const spend = {
    txid: TXID,
    version: 2,
    locktime: 0,
    size: 225,
    weight: 561,
    fee: 1410,
    vin: [
        {
            txid: 'b'.repeat(64),
            vout: 0,
            sequence: 0xfffffffd,
            witness: ['3044', '02aa'],
            prevout: { scriptpubkey_type: 'v0_p2wpkh', scriptpubkey_address: 'bc1qsender', value: 500_000 },
        },
    ],
    vout: [
        { scriptpubkey_type: 'v1_p2tr', scriptpubkey_address: 'bc1precipient', value: 300_000 },
        { scriptpubkey_type: 'v0_p2wpkh', scriptpubkey_address: 'bc1qchange', value: 198_590 },
    ],
    status: { confirmed: true, block_height: 800_000, block_hash: 'a'.repeat(64), block_time: 1_690_000_000 },
};

const coinbase = {
    ...spend,
    fee: 0,
    vin: [{ is_coinbase: true, sequence: 0xffffffff, witness: [] }],
    vout: [{ scriptpubkey_type: 'v0_p2wpkh', scriptpubkey_address: 'bc1qminer', value: 625_000_000 }],
};

const jsonResponse = (body) => ({ ok: true, status: 200, json: async () => body });
const textResponse = (body) => ({ ok: true, status: 200, text: async () => body });

const mockExplorer = (tx, { tipHeight = 800_005 } = {}) => {
    vi.spyOn(globalThis, 'fetch').mockImplementation((url) => {
        const target = String(url);
        if (target.endsWith('/blocks/tip/height')) return Promise.resolve(textResponse(String(tipHeight)));
        if (target.includes('/tx/')) {
            return Promise.resolve(
                tx === null
                    ? { ok: false, status: 404 }
                    : jsonResponse(tx),
            );
        }
        return Promise.resolve(jsonResponse({}));
    });
};

beforeEach(() => {
    resetTransactionCache();
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe('GET /proxy/tx/:txid', () => {
    it('rejects anything that is not a transaction id', async () => {
        const res = await request(app()).get('/proxy/tx/not-a-transaction');
        expect(res.status).toBe(400);
    });

    it('reports a transaction the explorer does not know', async () => {
        mockExplorer(null);
        const res = await request(app()).get(`/proxy/tx/${'c'.repeat(64)}`);
        expect(res.status).toBe(404);
    });

    it('describes a confirmed spend', async () => {
        mockExplorer(spend);
        const res = await request(app()).get(`/proxy/tx/${TXID}`);

        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({
            txid: TXID,
            confirmed: true,
            blockHeight: 800_000,
            confirmations: 6,
            isCoinbase: false,
            isSegwit: true,
            isRbf: true,
            fee: 1410,
            totalIn: 500_000,
            totalOut: 498_590,
        });
    });

    it('measures size in virtual bytes and derives the fee rate', async () => {
        mockExplorer(spend);
        const res = await request(app()).get(`/proxy/tx/${TXID}`);

        expect(res.body.vsize).toBe(141);
        expect(res.body.feeRate).toBe(10);
    });

    it('flags a coinbase transaction as having no inputs to spend', async () => {
        mockExplorer(coinbase);
        const res = await request(app()).get(`/proxy/tx/${TXID}`);

        expect(res.body.isCoinbase).toBe(true);
        expect(res.body.isRbf).toBe(false);
        expect(res.body.fee).toBe(0);
        expect(res.body.totalIn).toBe(0);
    });

    it('leaves confirmations empty when the chain tip is unknown', async () => {
        vi.spyOn(globalThis, 'fetch').mockImplementation((url) => {
            const target = String(url);
            if (target.endsWith('/blocks/tip/height')) return Promise.resolve({ ok: false, status: 503 });
            return Promise.resolve(jsonResponse(spend));
        });

        const res = await request(app()).get(`/proxy/tx/${TXID}`);
        expect(res.status).toBe(200);
        expect(res.body.confirmations).toBeNull();
    });

    it('serves a confirmed transaction from cache on the second look', async () => {
        mockExplorer(spend);

        await request(app()).get(`/proxy/tx/${TXID}`);
        const callsAfterFirst = vi.mocked(globalThis.fetch).mock.calls.length;

        const second = await request(app()).get(`/proxy/tx/${TXID}`);
        expect(second.status).toBe(200);
        expect(vi.mocked(globalThis.fetch).mock.calls).toHaveLength(callsAfterFirst);
    });

    it('reports upstream trouble as a gateway failure', async () => {
        vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
            Promise.resolve({ ok: false, status: 500 }));

        const res = await request(app()).get(`/proxy/tx/${TXID}`);
        expect(res.status).toBe(502);
    });
});
