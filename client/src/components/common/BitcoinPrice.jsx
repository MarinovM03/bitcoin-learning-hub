import { useState, useEffect } from "react";

export default function BitcoinPrice() {
    const [price, setPrice] = useState(null);

    useEffect(() => {
        const fetchPrice = () => {
            fetch("https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT")
                .then(response => response.json())
                .then(data => {
                    setPrice(parseFloat(data.price));
                })
                .catch(err => console.log(err));
        };

        fetchPrice();

        const interval = setInterval(fetchPrice, 5000);  // Update price every 5 sec

        return () => clearInterval(interval);
    }, []);

    if (!price) return null;

    return (
        <div className="btc-ticker">
            <span className="live-indicator"></span>
            <span className="btc-label">BTC</span>
            <span className="btc-value">${price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
        </div>
    );
}