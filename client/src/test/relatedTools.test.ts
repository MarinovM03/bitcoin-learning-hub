import { describe, it, expect } from 'vitest';
import { relatedTools } from '../utils/relatedTools';

describe('suggesting tools for an article', () => {
    it('suggests nothing for an article about nothing it covers', () => {
        expect(relatedTools('A history of the 2008 crisis', 'Banks, bailouts and balance sheets.')).toEqual([]);
    });

    it('matches the transaction explainer to an article about UTXOs', () => {
        const tools = relatedTools(
            'There Is No Such Thing as a Bitcoin Balance',
            'A UTXO is a discrete amount of bitcoin. Change is a new output paying the remainder back.',
        );
        expect(tools[0]?.to).toBe('/tx');
    });

    it('ranks a title match above a passing mention in the body', () => {
        const tools = relatedTools(
            'Understanding multisig',
            'A transaction spends inputs. Multisig needs several keys.',
        );
        expect(tools[0]?.to).toBe('/multisig');
    });

    it('never suggests more than three', () => {
        const everything = 'utxo transaction address segwit taproot multisig dca dollar-cost satoshi sats';
        expect(relatedTools('Everything', everything).length).toBeLessThanOrEqual(3);
    });

    it('does not match a keyword buried inside a longer word', () => {
        expect(relatedTools('Readdressing the problem', 'Readdressing and addressable markets.')).toEqual([]);
    });

    it('copes with an article that has no content yet', () => {
        expect(relatedTools(undefined, undefined)).toEqual([]);
        expect(relatedTools('Multisig', undefined)[0]?.to).toBe('/multisig');
    });
});
