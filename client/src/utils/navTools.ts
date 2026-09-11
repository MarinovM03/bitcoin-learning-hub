import { ArrowLeftRight, LineChart, FileSearch, Receipt, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavTool {
    to: string;
    label: string;
    short: string;
    description: string;
    detail: string;
    answers: string;
    keywords: string[];
    Icon: LucideIcon;
}

export const TOOLS: NavTool[] = [
    {
        to: '/converter',
        label: 'Sats Converter',
        short: 'Converter',
        description: 'BTC ↔ sats ↔ USD at live prices',
        detail: 'Three linked inputs that stay in step: type an amount in satoshis, bitcoin or dollars and the other two follow at the current spot price. Preset amounts for the figures that come up most often.',
        answers: 'How much is that in sats?',
        keywords: ['satoshi', 'satoshis', 'sats', 'denomination', 'unit'],
        Icon: ArrowLeftRight,
    },
    {
        to: '/dca',
        label: 'DCA Calculator',
        short: 'DCA',
        description: 'Backtest dollar-cost-averaging strategies',
        detail: 'Pick an amount, a frequency and a start date, and see what buying steadily would have returned against real historical prices — next to what a single lump sum on day one would have done.',
        answers: 'What if I had bought every week instead?',
        keywords: ['dca', 'dollar-cost', 'dollar cost averaging', 'averaging', 'accumulate'],
        Icon: LineChart,
    },
    {
        to: '/tx',
        label: 'Transaction Explainer',
        short: 'Transaction',
        description: 'Read what a transaction actually did',
        detail: 'Paste a transaction ID and read it in plain English: what went in, what came out, which output is probably change, what the fee bought, and how deeply it is buried. Block explorers show the data; this explains it.',
        answers: 'What actually happened in this transaction?',
        keywords: ['utxo', 'utxos', 'transaction', 'transactions', 'txid', 'change output', 'coinbase', 'mempool', 'rbf', 'replace-by-fee', 'fee rate', 'confirmation', 'confirmations'],
        Icon: Receipt,
    },
    {
        to: '/address',
        label: 'Address Lookup',
        short: 'Address',
        description: 'Decode and inspect Bitcoin addresses',
        detail: 'Paste any Bitcoin address and find out which format it is — Legacy, P2SH, Native SegWit, Taproot, Lightning or testnet — what that means for fees and compatibility, and where to look it up on-chain.',
        answers: 'What kind of address is this?',
        keywords: ['address', 'addresses', 'segwit', 'taproot', 'bech32', 'p2pkh', 'p2sh', 'p2wpkh', 'p2tr', 'legacy address'],
        Icon: FileSearch,
    },
    {
        to: '/multisig',
        label: 'Multisig Explainer',
        short: 'Multisig',
        description: 'Interactive multi-signature walkthrough',
        detail: 'Move the sliders on an M-of-N setup and watch what changes: how many keys can be lost before the funds are, how many an attacker needs, and which real-world arrangements each threshold suits.',
        answers: 'How many keys should I actually need?',
        keywords: ['multisig', 'multi-signature', 'multi-sig', 'm-of-n', 'threshold', 'cosigner', 'cosigners'],
        Icon: Users,
    },
];
