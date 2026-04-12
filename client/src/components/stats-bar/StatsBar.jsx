import { useEffect, useState } from "react";

function formatLargeNumber(value) {
    if (value == null) return '—';
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    return `$${value.toLocaleString()}`;
}

export default function StatsBar() {
    const [stats, setStats] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const controller = new AbortController();

        const fetchBinanceStats = () => {
            fetch("https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT", { signal: controller.signal })
                .then(res => res.ok ? res.json() : null)
                .then(data => {
                    if (!data) return;
                    const price = parseFloat(data.lastPrice);
                    const change24h = parseFloat(data.priceChangePercent);
                    const volume = parseFloat(data.quoteVolume);
                    if (Number.isNaN(price) || Number.isNaN(change24h) || Number.isNaN(volume)) return;
                    setStats(prev => ({ ...prev, price, change24h, volume }));
                    setIsLoading(false);
                })
                .catch(err => {
                    if (err.name !== 'AbortError') console.log("Binance stats fetch failed:", err.message);
                });
        };

        fetchBinanceStats();
        const interval = setInterval(fetchBinanceStats, 5000);
        return () => {
            controller.abort();
            clearInterval(interval);
        };
    }, []);

    useEffect(() => {
        const controller = new AbortController();

        const fetchDominance = () => {
            fetch(`${import.meta.env.VITE_API_URL}/proxy/btc-global`, { signal: controller.signal })
                .then(res => res.ok ? res.json() : null)
                .then(data => {
                    const pct = data?.data?.market_cap_percentage?.btc;
                    const totalCap = data?.data?.total_market_cap?.usd;
                    if (pct == null || totalCap == null) return;
                    setStats(prev => ({
                        ...prev,
                        dominance: pct,
                        marketCap: (totalCap * pct) / 100,
                    }));
                })
                .catch(err => {
                    if (err.name !== 'AbortError') console.log("Dominance fetch failed:", err.message);
                });
        };

        fetchDominance();
        const interval = setInterval(fetchDominance, 60000);
        return () => {
            controller.abort();
            clearInterval(interval);
        };
    }, []);

    if (isLoading) {
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
                    ${stats.price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
            </div>

            <div className="stat-item">
                <span className="stat-label">24h Change</span>
                <span className={`stat-value ${stats.change24h >= 0 ? 'stat-positive' : 'stat-negative'}`}>
                    {stats.change24h >= 0 ? '▲' : '▼'} {Math.abs(stats.change24h).toFixed(2)}%
                </span>
            </div>

            <div className="stat-item">
                <span className="stat-label">Market Cap</span>
                <span className="stat-value">
                    {formatLargeNumber(stats.marketCap)}
                </span>
            </div>

            <div className="stat-item">
                <span className="stat-label">BTC Dominance</span>
                <span className="stat-value">
                    {stats.dominance ? `${stats.dominance.toFixed(1)}%` : '—'}
                </span>
            </div>

            <div className="stat-item">
                <span className="stat-label">24h Volume</span>
                <span className="stat-value">
                    {formatLargeNumber(stats.volume)}
                </span>
            </div>
        </div>
    );
}