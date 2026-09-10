import type { TransactionParty, TransactionDetail } from '../services/transactionService';

export const SCRIPT_TYPE_LABELS: Record<string, string> = {
    p2pk: 'Pay to Public Key',
    p2pkh: 'Legacy',
    p2sh: 'SegWit (compatible)',
    v0_p2wpkh: 'Native SegWit',
    v0_p2wsh: 'Native SegWit Script',
    v1_p2tr: 'Taproot',
    op_return: 'Data (OP_RETURN)',
    unknown: 'Unknown',
};

export const scriptTypeLabel = (scriptType: string): string =>
    SCRIPT_TYPE_LABELS[scriptType] ?? scriptType;

export const formatSats = (sats: number): string => sats.toLocaleString('en-US');

export const formatBtc = (sats: number): string => {
    const btc = sats / 100_000_000;
    if (btc === 0) return '0 BTC';
    if (btc < 0.0001) return `${btc.toFixed(8)} BTC`;
    return `${btc.toLocaleString('en-US', { maximumFractionDigits: 8 })} BTC`;
};

export interface FeeVerdict {
    tone: 'low' | 'normal' | 'high' | 'extreme' | 'none';
    label: string;
    note: string;
}

export const describeFee = (tx: TransactionDetail): FeeVerdict => {
    if (tx.isCoinbase) {
        return {
            tone: 'none',
            label: 'No fee',
            note: 'This is a coinbase transaction — the reward a miner pays themselves for finding the block. It has no inputs to spend, so there is nothing to pay a fee from.',
        };
    }

    const rate = tx.feeRate;
    if (rate < 2) {
        return {
            tone: 'low',
            label: 'Economical',
            note: 'A low fee rate. Transactions like this confirm quickly when the mempool is quiet, and can wait hours or days when it is busy.',
        };
    }
    if (rate < 20) {
        return {
            tone: 'normal',
            label: 'Ordinary',
            note: 'A typical fee rate for everyday use. This is roughly what a wallet suggests when it expects confirmation within a few blocks.',
        };
    }
    if (rate < 500) {
        return {
            tone: 'high',
            label: 'In a hurry',
            note: 'A high fee rate. Either the mempool was congested, or the sender wanted to be in the very next block.',
        };
    }
    return {
        tone: 'extreme',
        label: 'Far above the going rate',
        note: 'Nobody needs to pay this much. A fee rate this high almost always means a mistake — a misconfigured wallet, or a transaction from the early years before fees were a market at all. Miners keep it either way.',
    };
};

export interface ChangeGuess {
    index: number | null;
    reason: string;
}

/**
 * Which output looks like change is a guess, never a fact — the chain does not
 * label it. Only claim one when a single output matches the script type being
 * spent, which is the weakest assumption that still says something useful.
 */
export const guessChangeOutput = (tx: TransactionDetail): ChangeGuess => {
    if (tx.isCoinbase || tx.outputs.length !== 2 || tx.inputs.length === 0) {
        return { index: null, reason: '' };
    }

    const spentTypes = new Set(tx.inputs.map(input => input.scriptType));
    const matching = tx.outputs.filter(output => spentTypes.has(output.scriptType));

    if (matching.length !== 1) {
        return { index: null, reason: '' };
    }

    return {
        index: matching[0]!.index,
        reason: `Output ${matching[0]!.index + 1} uses the same address type the sender was spending from, so it is probably change returning to them rather than a payment.`,
    };
};

export const summarise = (tx: TransactionDetail): string => {
    if (tx.isCoinbase) {
        return `A miner claimed the reward for block ${tx.blockHeight?.toLocaleString('en-US') ?? '—'}, creating ${formatBtc(tx.totalOut)} out of nothing. This is the only way new bitcoin comes into existence.`;
    }

    const inCount = tx.inputs.length;
    const outCount = tx.outputs.length;
    const change = guessChangeOutput(tx);
    const paid = change.index === null
        ? tx.totalOut
        : tx.totalOut - (tx.outputs[change.index]?.value ?? 0);

    const spent = `Someone gathered ${inCount === 1 ? 'one earlier payment' : `${inCount} earlier payments`} worth ${formatBtc(tx.totalIn)}`;
    const created = `${outCount === 1 ? 'a single new payment' : `${outCount} new payments`}`;
    const moved = change.index === null
        ? `and split the value into ${created}.`
        : `and sent about ${formatBtc(paid)} onward, with the rest coming back as change.`;

    return `${spent} ${moved}`;
};

export interface ExplainedFact {
    label: string;
    value: string;
    note: string;
}

export const explainFacts = (tx: TransactionDetail): ExplainedFact[] => {
    const facts: ExplainedFact[] = [];

    facts.push({
        label: 'Status',
        value: tx.confirmed
            ? `Confirmed · ${tx.confirmations?.toLocaleString('en-US') ?? '?'} block${tx.confirmations === 1 ? '' : 's'} deep`
            : 'Waiting in the mempool',
        note: tx.confirmed
            ? 'Every block mined on top makes this harder to reverse. Six blocks is the common rule of thumb for treating a payment as settled.'
            : 'The transaction has been broadcast but no miner has included it in a block yet. Until then it can still be replaced or dropped.',
    });

    facts.push({
        label: 'Size',
        value: `${formatSats(tx.vsize)} vBytes`,
        note: 'Block space is sold by size, not by amount. Moving 1 BTC and 1,000 BTC cost the same if the transaction takes up the same room.',
    });

    facts.push({
        label: 'Signature type',
        value: tx.isSegwit ? 'SegWit' : 'Pre-SegWit',
        note: tx.isSegwit
            ? 'Signatures are stored in a separate witness section, which is discounted when block space is measured. That is why SegWit transactions cost less.'
            : 'Signatures sit in the main body of the transaction, with no witness discount. This costs more per byte than a SegWit spend.',
    });

    if (!tx.isCoinbase) {
        facts.push({
            label: 'Replaceable',
            value: tx.isRbf ? 'Yes — signals RBF' : 'No',
            note: tx.isRbf
                ? 'The sender flagged this as replaceable, so while it is unconfirmed they can re-send it with a higher fee. Treat it as final only once it is in a block.'
                : 'The sender did not signal replace-by-fee, so bumping the fee would mean spending one of the same inputs again.',
        });
    }

    if (tx.locktime > 0) {
        facts.push({
            label: 'Locktime',
            value: tx.locktime < 500_000_000
                ? `Block ${tx.locktime.toLocaleString('en-US')}`
                : new Date(tx.locktime * 1000).toUTCString(),
            note: 'A locktime tells the network this transaction was not valid before a given point. Many wallets set it to the current height to discourage fee sniping.',
        });
    }

    return facts;
};

export const partyLabel = (party: TransactionParty): string =>
    party.address ?? (party.scriptType === 'op_return' ? 'Data, not an address' : 'Unrecognised script');
