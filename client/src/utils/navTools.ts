import { ArrowLeftRight, LineChart, FileSearch, Layers, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavTool {
    to: string;
    label: string;
    short: string;
    description: string;
    Icon: LucideIcon;
}

export const TOOLS: NavTool[] = [
    {
        to: '/converter',
        label: 'Sats Converter',
        short: 'Converter',
        description: 'BTC ↔ sats ↔ USD at live prices',
        Icon: ArrowLeftRight,
    },
    {
        to: '/dca',
        label: 'DCA Calculator',
        short: 'DCA',
        description: 'Backtest dollar-cost-averaging strategies',
        Icon: LineChart,
    },
    {
        to: '/address',
        label: 'Address Lookup',
        short: 'Address',
        description: 'Decode and inspect Bitcoin addresses',
        Icon: FileSearch,
    },
    {
        to: '/mempool',
        label: 'Mempool Visualizer',
        short: 'Mempool',
        description: 'Live view of unconfirmed transactions',
        Icon: Layers,
    },
    {
        to: '/multisig',
        label: 'Multisig Explainer',
        short: 'Multisig',
        description: 'Interactive multi-signature walkthrough',
        Icon: Users,
    },
];
