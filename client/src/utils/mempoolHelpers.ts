const MEMPOOL_API = 'https://mempool.space/api';

export const MAX_BUBBLES = 60;
export const CANVAS_HEIGHT = 500;
export const REFRESH_STATS = 30_000;
export const REFRESH_TXS = 5_000;

export interface FeeTier {
    label: string;
    key: 'priority' | 'fast' | 'medium' | 'slow' | 'no-rush';
    min: number;
    color: string;
    description: string;
}

export const FEE_TIERS: readonly FeeTier[] = [
    { label: 'Priority', key: 'priority', min: 100, color: '#e74c3c', description: '≥100 sat/vB — next block guaranteed' },
    { label: 'Fast',     key: 'fast',     min: 30,  color: '#F7931A', description: '30–99 sat/vB — within 1–2 blocks' },
    { label: 'Medium',   key: 'medium',   min: 10,  color: '#f1c40f', description: '10–29 sat/vB — within a few blocks' },
    { label: 'Slow',     key: 'slow',     min: 5,   color: '#3498db', description: '5–9 sat/vB — may wait an hour+' },
    { label: 'No Rush',  key: 'no-rush',  min: 0,   color: '#555555', description: '<5 sat/vB — could be stuck' },
];

export function getFeeColor(feeRate: number): string {
    for (const tier of FEE_TIERS) {
        if (feeRate >= tier.min) return tier.color;
    }
    return FEE_TIERS[FEE_TIERS.length - 1]!.color;
}

export function getFeeLabel(feeRate: number): string {
    for (const tier of FEE_TIERS) {
        if (feeRate >= tier.min) return tier.label;
    }
    return FEE_TIERS[FEE_TIERS.length - 1]!.label;
}

export interface MempoolTx {
    txid: string;
    fee: number;
    vsize: number;
    value?: number;
}

export interface Bubble {
    txid: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
    phase: number;
    radius: number;
    color: string;
    opacity: number;
    hovered: boolean;
    fee: number;
    feeRate: number;
    value: number;
    vsize: number;
}

export function buildBubble(
    tx: MempoolTx,
    canvasWidth: number,
    canvasHeight: number,
    minFee: number,
    maxFee: number,
): Bubble {
    const feeRate = tx.fee / tx.vsize;
    const MIN_R = 12;
    const MAX_R = 46;

    let radius: number;
    if (maxFee === minFee) {
        radius = (MIN_R + MAX_R) / 2;
    } else {
        const t = Math.log1p(tx.fee - minFee) / Math.log1p(maxFee - minFee);
        radius = MIN_R + t * (MAX_R - MIN_R);
    }

    return {
        txid:    tx.txid,
        x:       radius + Math.random() * (canvasWidth - radius * 2),
        y:       canvasHeight + radius + Math.random() * 80,
        vx:      (Math.random() - 0.5) * 0.35,
        vy:      -(0.18 + Math.random() * 0.22),
        phase:   Math.random() * Math.PI * 2,
        radius,
        color:   getFeeColor(feeRate),
        opacity: 0,
        hovered: false,
        fee:     tx.fee,
        feeRate,
        value:   tx.value ?? 0,
        vsize:   tx.vsize,
    };
}

export function formatSats(sats: number): string {
    if (sats >= 100_000_000) return (sats / 100_000_000).toFixed(4) + ' BTC';
    if (sats >= 1_000)       return (sats / 1_000).toFixed(1) + 'k sats';
    return sats + ' sats';
}

export function formatMempoolSize(vsize: number): string {
    return (vsize / 1_000_000).toFixed(2) + ' MB';
}

export function formatFeeRate(rate: number): string {
    return rate.toFixed(1) + ' sat/vB';
}

export function formatTotalFees(sats: number): string {
    return (sats / 100_000_000).toFixed(4) + ' BTC';
}

export interface MempoolStats {
    count: number;
    vsize: number;
    total_fee: number;
    fee_histogram: Array<[number, number]>;
}

export interface RecommendedFees {
    fastestFee: number;
    halfHourFee: number;
    hourFee: number;
    economyFee: number;
    minimumFee: number;
}

export async function fetchMempoolStats(signal?: AbortSignal): Promise<MempoolStats> {
    const res = await fetch(`${MEMPOOL_API}/mempool`, { signal });
    if (!res.ok) throw new Error('Failed to fetch mempool stats');
    return res.json() as Promise<MempoolStats>;
}

export async function fetchRecentTxs(signal?: AbortSignal): Promise<MempoolTx[]> {
    const res = await fetch(`${MEMPOOL_API}/mempool/recent`, { signal });
    if (!res.ok) throw new Error('Failed to fetch recent transactions');
    return res.json() as Promise<MempoolTx[]>;
}

export async function fetchRecommendedFees(signal?: AbortSignal): Promise<RecommendedFees> {
    const res = await fetch(`${MEMPOOL_API}/v1/fees/recommended`, { signal });
    if (!res.ok) throw new Error('Failed to fetch recommended fees');
    return res.json() as Promise<RecommendedFees>;
}
