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
        const fetchBinanceStats = () => {
            fetch("https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT")
                .then(res => res.json())
                .then(data => {
                    setStats(prev => ({
                        ...prev,
                        price:     parseFloat(data.lastPrice),
                        change24h: parseFloat(data.priceChangePercent),
                        volume:    parseFloat(data.quoteVolume),
                    }));
                    setIsLoading(false);
                })
                .catch(err => console.log("Binance stats fetch failed:", err));
        };

        fetchBinanceStats();
        const interval = setInterval(fetchBinanceStats, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const fetchDominance = () => {
            fetch(`${import.meta.env.VITE_API_URL}/proxy/btc-global`)
                .then(res => res.json())
                .then(data => {
                    setStats(prev => ({
                        ...prev,
                        dominance: data.data.market_cap_percentage.btc,
                        marketCap: (data.data.total_market_cap.usd * data.data.market_cap_percentage.btc) / 100,
                    }));
                })
                .catch(err => console.log("Dominance fetch failed:", err));
        };

        fetchDominance();
        const interval = setInterval(fetchDominance, 60000);
        return () => clearInterval(interval);
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