import { useBinanceTicker, useBtcGlobal, useFearGreed, getSentimentKey } from "../../hooks/queries/useMarketData";

export default function TopBar() {
    const { data: ticker } = useBinanceTicker();
    const { data: global } = useBtcGlobal();
    const { data: fearGreed } = useFearGreed();

    const changeClass = ticker == null
        ? ""
        : ticker.change24h >= 0 ? "topbar-value--up" : "topbar-value--down";

    const fgKey = fearGreed ? getSentimentKey(fearGreed.value) : null;

    return (
        <div className="topbar" role="complementary" aria-label="Live market data">
            <div className="topbar-inner">
                <div className="topbar-live">
                    <span className="topbar-live-dot" aria-hidden="true" />
                    <span className="topbar-live-label">Live</span>
                </div>

                <div className="topbar-item">
                    <span className="topbar-label">BTC</span>
                    <span className="topbar-value">
                        {ticker != null
                            ? `$${ticker.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                            : "—"}
                    </span>
                </div>

                <div className="topbar-item topbar-item--hide-sm">
                    <span className="topbar-label">24h</span>
                    <span className={`topbar-value ${changeClass}`}>
                        {ticker != null
                            ? `${ticker.change24h >= 0 ? "+" : ""}${ticker.change24h.toFixed(2)}%`
                            : "—"}
                    </span>
                </div>

                <div className="topbar-item topbar-item--hide-md">
                    <span className="topbar-label">Dominance</span>
                    <span className="topbar-value">
                        {global != null ? `${global.dominance.toFixed(1)}%` : "—"}
                    </span>
                </div>

                <div className="topbar-item topbar-item--hide-md">
                    <span className="topbar-label">Fear &amp; Greed</span>
                    {fearGreed ? (
                        <span className={`topbar-fg topbar-fg--${fgKey}`}>
                            {fearGreed.value} · {fearGreed.label}
                        </span>
                    ) : (
                        <span className="topbar-value">—</span>
                    )}
                </div>
            </div>
        </div>
    );
}
