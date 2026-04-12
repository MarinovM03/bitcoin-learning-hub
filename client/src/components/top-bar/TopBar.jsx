import { useEffect, useState } from "react";

function getSentimentKey(value) {
    if (value <= 25) return "extreme-fear";
    if (value <= 45) return "fear";
    if (value <= 55) return "neutral";
    if (value <= 75) return "greed";
    return "extreme-greed";
}

export default function TopBar() {
    const [market, setMarket] = useState({ price: null, change24h: null });
    const [dominance, setDominance] = useState(null);
    const [fearGreed, setFearGreed] = useState(null);

    useEffect(() => {
        const controller = new AbortController();

        const fetchMarket = () => {
            fetch("https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT", { signal: controller.signal })
                .then(res => res.ok ? res.json() : null)
                .then(data => {
                    if (!data) return;
                    const price = parseFloat(data.lastPrice);
                    const change24h = parseFloat(data.priceChangePercent);
                    if (Number.isNaN(price) || Number.isNaN(change24h)) return;
                    setMarket({ price, change24h });
                })
                .catch(err => {
                    if (err.name !== "AbortError") console.log("TopBar market fetch failed:", err.message);
                });
        };

        fetchMarket();
        const interval = setInterval(fetchMarket, 5000);
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
                    if (pct == null) return;
                    setDominance(pct);
                })
                .catch(err => {
                    if (err.name !== "AbortError") console.log("TopBar dominance fetch failed:", err.message);
                });
        };

        fetchDominance();
        const interval = setInterval(fetchDominance, 60000);
        return () => {
            controller.abort();
            clearInterval(interval);
        };
    }, []);

    useEffect(() => {
        const controller = new AbortController();

        fetch("https://api.alternative.me/fng/", { signal: controller.signal })
            .then(res => res.ok ? res.json() : null)
            .then(json => {
                const entry = json?.data?.[0];
                if (!entry) return;
                setFearGreed({
                    value: parseInt(entry.value, 10),
                    label: entry.value_classification,
                });
            })
            .catch(err => {
                if (err.name !== "AbortError") console.log("TopBar F&G fetch failed:", err.message);
            });

        return () => controller.abort();
    }, []);

    const changeClass = market.change24h == null
        ? ""
        : market.change24h >= 0 ? "topbar-value--up" : "topbar-value--down";

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
                        {market.price != null
                            ? `$${market.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                            : "—"}
                    </span>
                </div>

                <div className="topbar-item topbar-item--hide-sm">
                    <span className="topbar-label">24h</span>
                    <span className={`topbar-value ${changeClass}`}>
                        {market.change24h != null
                            ? `${market.change24h >= 0 ? "+" : ""}${market.change24h.toFixed(2)}%`
                            : "—"}
                    </span>
                </div>

                <div className="topbar-item topbar-item--hide-md">
                    <span className="topbar-label">Dominance</span>
                    <span className="topbar-value">
                        {dominance != null ? `${dominance.toFixed(1)}%` : "—"}
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
