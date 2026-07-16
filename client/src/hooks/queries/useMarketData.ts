import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '../../lib/apiConfig';
import { queryKeys } from '../../lib/queryKeys';

export interface BinanceTicker {
    price: number;
    change24h: number;
    volume: number;
}

export interface BtcGlobal {
    dominance: number;
    marketCap: number;
}

export interface FearGreed {
    value: number;
    label: string;
}

export function getSentimentKey(value: number) {
    if (value <= 25) return 'extreme-fear';
    if (value <= 45) return 'fear';
    if (value <= 55) return 'neutral';
    if (value <= 75) return 'greed';
    return 'extreme-greed';
}

const fetchBinanceTicker = async (): Promise<BinanceTicker> => {
    const res = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT');
    if (!res.ok) throw new Error('Binance request failed');
    const data = await res.json();
    const price = parseFloat(data.lastPrice);
    const change24h = parseFloat(data.priceChangePercent);
    const volume = parseFloat(data.quoteVolume);
    if (Number.isNaN(price) || Number.isNaN(change24h) || Number.isNaN(volume)) {
        throw new Error('Binance returned malformed data');
    }
    return { price, change24h, volume };
};

const fetchBtcGlobal = async (): Promise<BtcGlobal> => {
    const res = await fetch(`${API_BASE_URL}/proxy/btc-global`);
    if (!res.ok) throw new Error('Market proxy request failed');
    const data = await res.json();
    const pct = data?.data?.market_cap_percentage?.btc;
    const totalCap = data?.data?.total_market_cap?.usd;
    if (pct == null || totalCap == null) {
        throw new Error('Market proxy returned malformed data');
    }
    return { dominance: pct, marketCap: (totalCap * pct) / 100 };
};

const fetchFearGreed = async (): Promise<FearGreed> => {
    const res = await fetch('https://api.alternative.me/fng/');
    if (!res.ok) throw new Error('Fear & Greed request failed');
    const json = await res.json();
    const entry = json?.data?.[0];
    const value = parseInt(entry?.value, 10);
    if (!entry || Number.isNaN(value)) {
        throw new Error('Fear & Greed returned malformed data');
    }
    return { value, label: entry.value_classification };
};

export const useBinanceTicker = () => useQuery({
    queryKey: queryKeys.market.binance,
    queryFn: fetchBinanceTicker,
    refetchInterval: 5000,
    staleTime: 4000,
});

export const useBtcGlobal = () => useQuery({
    queryKey: queryKeys.market.global,
    queryFn: fetchBtcGlobal,
    refetchInterval: 60_000,
    staleTime: 55_000,
});

export const useFearGreed = () => useQuery({
    queryKey: queryKeys.market.fearGreed,
    queryFn: fetchFearGreed,
    staleTime: 30 * 60_000,
});
