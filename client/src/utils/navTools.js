import { ArrowLeftRight, LineChart, FileSearch, Layers, Users } from 'lucide-react';

export const TOOLS = [
    {
        to: '/converter',
        label: 'Sats Converter',
        description: 'BTC ↔ sats ↔ USD at live prices',
        Icon: ArrowLeftRight,
    },
    {
        to: '/dca',
        label: 'DCA Calculator',
        description: 'Backtest dollar-cost-averaging strategies',
        Icon: LineChart,
    },
    {
        to: '/address',
        label: 'Address Lookup',
        description: 'Decode and inspect Bitcoin addresses',
        Icon: FileSearch,
    },
    {
        to: '/mempool',
        label: 'Mempool Visualizer',
        description: 'Live view of unconfirmed transactions',
        Icon: Layers,
    },
    {
        to: '/multisig',
        label: 'Multisig Explainer',
        description: 'Interactive multi-signature walkthrough',
        Icon: Users,
    },
];
