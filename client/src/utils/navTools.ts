import { ArrowLeftRight, LineChart, FileSearch, Receipt, Users } from 'lucide-react';
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
        to: '/tx',
        label: 'Transaction Explainer',
        short: 'Transaction',
        description: 'Read what a transaction actually did',
        Icon: Receipt,
    },
    {
        to: '/address',
        label: 'Address Lookup',
        short: 'Address',
        description: 'Decode and inspect Bitcoin addresses',
        Icon: FileSearch,
    },
    {
        to: '/multisig',
        label: 'Multisig Explainer',
        short: 'Multisig',
        description: 'Interactive multi-signature walkthrough',
        Icon: Users,
    },
];
