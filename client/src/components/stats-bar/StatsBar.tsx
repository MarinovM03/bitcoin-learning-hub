import { useBinanceTicker, useBtcGlobal } from "../../hooks/queries/useMarketData";

function formatLargeNumber(value: number | null | undefined): string {
    if (value == null) return '—';
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    return `$${value.toLocaleString()}`;
}

export default function StatsBar() {
    const { data: binance } = useBinanceTicker();
    const { data: global } = useBtcGlobal();

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
