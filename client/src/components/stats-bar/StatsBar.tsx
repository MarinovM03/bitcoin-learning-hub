import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL } from "../../lib/apiConfig";
import { queryKeys } from "../../lib/queryKeys";

function formatLargeNumber(value: number | null | undefined): string {
    if (value == null) return '—';
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    return `$${value.toLocaleString()}`;
}

interface BinanceStats {
    price: number;
    change24h: number;
    volume: number;
}

interface GlobalStats {
    dominance: number;
    marketCap: number;
}

const fetchBinanceStats = async (): Promise<BinanceStats> => {
    const res = await fetch("https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT");
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

const fetchGlobalStats = async (): Promise<GlobalStats> => {
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

export default function StatsBar() {
    const { data: binance } = useQuery({
        queryKey: queryKeys.market.binance,
        queryFn: fetchBinanceStats,
        refetchInterval: 5000,
        staleTime: 4000,
    });

    const { data: global } = useQuery({
        queryKey: queryKeys.market.global,
        queryFn: fetchGlobalStats,
        refetchInterval: 60_000,
        staleTime: 55_000,
    });

    if (!binance) {
        return (
            <div className="stats-bar">
                <span className="stats-loading">Loading market data...</span>
            </div>
        );
    }

    return (
        <div className="stats-bar">
            <div className="stat-item">
                <span className="stat-label">BTC Price</span>
                <span className="stat-value">
                    ${binance.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
            </div>

            <div className="stat-item">
                <span className="stat-label">24h Change</span>
                <span className={`stat-value ${binance.change24h >= 0 ? 'stat-positive' : 'stat-negative'}`}>
                    {binance.change24h >= 0 ? '▲' : '▼'} {Math.abs(binance.change24h).toFixed(2)}%
                </span>
            </div>

            <div className="stat-item">
                <span className="stat-label">Market Cap</span>
                <span className="stat-value">
                    {formatLargeNumber(global?.marketCap)}
                </span>
            </div>

            <div className="stat-item">
                <span className="stat-label">BTC Dominance</span>
                <span className="stat-value">
                    {global ? `${global.dominance.toFixed(1)}%` : '—'}
                </span>
            </div>

            <div className="stat-item">
                <span className="stat-label">24h Volume</span>
                <span className="stat-value">
                    {formatLargeNumber(binance.volume)}
                </span>
            </div>
        </div>
    );
}
