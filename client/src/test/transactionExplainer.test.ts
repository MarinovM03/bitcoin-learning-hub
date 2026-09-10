import { describe, it, expect } from 'vitest';
import {
    describeFee,
    explainFacts,
    formatBtc,
    guessChangeOutput,
    scriptTypeLabel,
    summarise,
} from '../utils/transactionExplainer';
import type { TransactionDetail, TransactionParty } from '../services/transactionService';

const party = (over: Partial<TransactionParty> & { index: number }): TransactionParty => ({
    address: 'bc1qexample',
    scriptType: 'v0_p2wpkh',
    value: 100_000,
    ...over,
});

const tx = (over: Partial<TransactionDetail> = {}): TransactionDetail => ({
    txid: 'a'.repeat(64),
    confirmed: true,
    blockHeight: 800_000,
    blockTime: 1_690_000_000,
    confirmations: 6,
    isCoinbase: false,
    isRbf: false,
    isSegwit: true,
    version: 2,
    locktime: 0,
    size: 225,
    weight: 561,
    vsize: 141,
    fee: 1410,
    feeRate: 10,
    totalIn: 500_000,
    totalOut: 498_590,
    inputs: [party({ index: 0, value: 500_000 })],
    outputs: [
        party({ index: 0, scriptType: 'v1_p2tr', value: 300_000 }),
        party({ index: 1, scriptType: 'v0_p2wpkh', value: 198_590 }),
    ],
    ...over,
});

describe('guessing which output is change', () => {
    it('picks the output matching the address type being spent', () => {
        const guess = guessChangeOutput(tx());
        expect(guess.index).toBe(1);
        expect(guess.reason).toMatch(/probably change/i);
    });

    it('stays silent when both outputs match the input type', () => {
        const guess = guessChangeOutput(tx({
            outputs: [
                party({ index: 0, scriptType: 'v0_p2wpkh' }),
                party({ index: 1, scriptType: 'v0_p2wpkh' }),
            ],
        }));
        expect(guess.index).toBeNull();
    });

    it('stays silent when neither output matches', () => {
        const guess = guessChangeOutput(tx({
            outputs: [
                party({ index: 0, scriptType: 'v1_p2tr' }),
                party({ index: 1, scriptType: 'p2pkh' }),
            ],
        }));
        expect(guess.index).toBeNull();
    });

    it('stays silent when there are not exactly two outputs', () => {
        expect(guessChangeOutput(tx({ outputs: [party({ index: 0 })] })).index).toBeNull();
        expect(guessChangeOutput(tx({
            outputs: [party({ index: 0 }), party({ index: 1 }), party({ index: 2 })],
        })).index).toBeNull();
    });

    it('stays silent for a coinbase transaction', () => {
        expect(guessChangeOutput(tx({ isCoinbase: true })).index).toBeNull();
    });
});

describe('describing the fee', () => {
    it('calls a coinbase transaction out as having no fee', () => {
        const verdict = describeFee(tx({ isCoinbase: true }));
        expect(verdict.tone).toBe('none');
        expect(verdict.note).toMatch(/coinbase/i);
    });

    it('grades the rate', () => {
        expect(describeFee(tx({ feeRate: 1 })).tone).toBe('low');
        expect(describeFee(tx({ feeRate: 10 })).tone).toBe('normal');
        expect(describeFee(tx({ feeRate: 120 })).tone).toBe('high');
    });

    it('calls an absurd rate a mistake rather than urgency', () => {
        const verdict = describeFee(tx({ feeRate: 4191 }));
        expect(verdict.tone).toBe('extreme');
        expect(verdict.note).toMatch(/mistake/i);
    });
});

describe('the plain-English summary', () => {
    it('explains a coinbase as new bitcoin', () => {
        expect(summarise(tx({ isCoinbase: true }))).toMatch(/out of nothing/i);
    });

    it('mentions change when one output looks like it', () => {
        expect(summarise(tx())).toMatch(/coming back as change/i);
    });

    it('describes a split when no change is identifiable', () => {
        const summary = summarise(tx({
            outputs: [
                party({ index: 0, scriptType: 'v1_p2tr' }),
                party({ index: 1, scriptType: 'p2pkh' }),
            ],
        }));
        expect(summary).toMatch(/split the value/i);
    });
});

describe('the explained facts', () => {
    it('reports confirmation depth for a mined transaction', () => {
        const status = explainFacts(tx()).find(f => f.label === 'Status');
        expect(status?.value).toMatch(/6 blocks deep/);
    });

    it('reports a pending transaction as waiting', () => {
        const status = explainFacts(tx({ confirmed: false, confirmations: null }))
            .find(f => f.label === 'Status');
        expect(status?.value).toMatch(/mempool/i);
    });

    it('leaves the replaceable line out for a coinbase', () => {
        const labels = explainFacts(tx({ isCoinbase: true })).map(f => f.label);
        expect(labels).not.toContain('Replaceable');
    });

    it('only mentions locktime when one is set', () => {
        expect(explainFacts(tx()).map(f => f.label)).not.toContain('Locktime');
        expect(explainFacts(tx({ locktime: 799_999 })).map(f => f.label)).toContain('Locktime');
    });
});

describe('formatting', () => {
    it('names script types in words', () => {
        expect(scriptTypeLabel('v1_p2tr')).toBe('Taproot');
        expect(scriptTypeLabel('v0_p2wpkh')).toBe('Native SegWit');
        expect(scriptTypeLabel('something_new')).toBe('something_new');
    });

    it('keeps small amounts readable', () => {
        expect(formatBtc(100_000_000)).toBe('1 BTC');
        expect(formatBtc(1)).toBe('0.00000001 BTC');
        expect(formatBtc(0)).toBe('0 BTC');
    });
});
