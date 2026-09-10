import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const MEMPOOL_API = 'https://mempool.space/api';
const REQUEST_TIMEOUT_MS = 8000;
const TX_CACHE_TTL_MS = 5 * 60 * 1000;
const TIP_CACHE_TTL_MS = 30_000;
const MAX_CACHED_TX = 200;

const txCache = new Map();
let tipCache = { height: null, timestamp: 0 };

export const resetTransactionCache = () => {
    txCache.clear();
    tipCache = { height: null, timestamp: 0 };
};

const rememberTx = (txid, payload) => {
    if (txCache.size >= MAX_CACHED_TX) {
        txCache.delete(txCache.keys().next().value);
    }
    txCache.set(txid, { payload, timestamp: Date.now() });
};

const fetchJson = async (url) => {
    const response = await fetch(url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
    if (!response.ok) return { ok: false, status: response.status };
    return { ok: true, body: await response.json() };
};

const fetchTipHeight = async () => {
    const now = Date.now();
    if (tipCache.height !== null && now - tipCache.timestamp < TIP_CACHE_TTL_MS) {
        return tipCache.height;
    }

    try {
        const response = await fetch(`${MEMPOOL_API}/blocks/tip/height`, {
            signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });
        if (!response.ok) return tipCache.height;

        const height = parseInt(await response.text(), 10);
        if (!Number.isFinite(height)) return tipCache.height;

        tipCache = { height, timestamp: now };
        return height;
    } catch {
        return tipCache.height;
    }
};

const shapeParty = (entry, index) => ({
    index,
    address: entry?.scriptpubkey_address ?? null,
    scriptType: entry?.scriptpubkey_type ?? 'unknown',
    value: entry?.value ?? 0,
});

const shape = (tx, tipHeight) => {
    const inputs = (tx.vin ?? []).map((vin, index) => ({
        ...shapeParty(vin.prevout, index),
        sourceTxid: vin.txid ?? null,
        sourceVout: typeof vin.vout === 'number' ? vin.vout : null,
        hasWitness: Array.isArray(vin.witness) && vin.witness.length > 0,
        sequence: typeof vin.sequence === 'number' ? vin.sequence : null,
    }));

    const outputs = (tx.vout ?? []).map((vout, index) => shapeParty(vout, index));

    const isCoinbase = Boolean(tx.vin?.[0]?.is_coinbase);
    const weight = tx.weight ?? 0;
    const vsize = weight ? Math.ceil(weight / 4) : (tx.size ?? 0);
    const fee = isCoinbase ? 0 : (tx.fee ?? 0);

    const confirmed = Boolean(tx.status?.confirmed);
    const blockHeight = tx.status?.block_height ?? null;
    const confirmations = confirmed && tipHeight !== null && blockHeight !== null
        ? Math.max(1, tipHeight - blockHeight + 1)
        : null;

    return {
        txid: tx.txid,
        confirmed,
        blockHeight,
        blockTime: tx.status?.block_time ?? null,
        confirmations,
        isCoinbase,
        isRbf: !isCoinbase && inputs.some(input => input.sequence !== null && input.sequence < 0xfffffffe),
        isSegwit: inputs.some(input => input.hasWitness),
        version: tx.version ?? null,
        locktime: tx.locktime ?? 0,
        size: tx.size ?? 0,
        weight,
        vsize,
        fee,
        feeRate: vsize > 0 ? Number((fee / vsize).toFixed(2)) : 0,
        totalIn: inputs.reduce((sum, input) => sum + input.value, 0),
        totalOut: outputs.reduce((sum, output) => sum + output.value, 0),
        inputs,
        outputs,
    };
};

export const getTransaction = asyncHandler(async (req, res) => {
    const txid = req.params.txid.toLowerCase();

    const cached = txCache.get(txid);
    if (cached && Date.now() - cached.timestamp < TX_CACHE_TTL_MS) {
        return res.json(cached.payload);
    }

    let result;
    try {
        result = await fetchJson(`${MEMPOOL_API}/tx/${txid}`);
    } catch {
        throw new AppError(502, 'Could not reach the block explorer. Try again in a moment.');
    }

    if (!result.ok) {
        if (result.status === 404) {
            throw new AppError(404, 'No transaction with that ID. Check for a typo, or it may not have reached the network yet.');
        }
        throw new AppError(502, 'The block explorer could not answer right now. Try again in a moment.');
    }

    const payload = shape(result.body, await fetchTipHeight());
    if (payload.confirmed) {
        rememberTx(txid, payload);
    }

    res.json(payload);
});
