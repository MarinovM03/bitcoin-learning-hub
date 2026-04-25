import { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';
import PageMeta from '../page-meta/PageMeta';

const PRESETS = [
    { label: '1 sat', field: 'sats', value: '1' },
    { label: '1,000 sats', field: 'sats', value: '1000' },
    { label: '100k sats', field: 'sats', value: '100000' },
    { label: '0.01 BTC', field: 'btc', value: '0.01' },
    { label: '1 BTC', field: 'btc', value: '1' },
    { label: '10,000 BTC', field: 'btc', value: '10000', hint: 'Pizza Day' },
];

function formatBtc(n) {
    if (!Number.isFinite(n) || n === 0) return '0';
    const fixed = n.toFixed(8);
    return fixed.includes('.') ? fixed.replace(/\.?0+$/, '') : fixed;
}

function formatSats(n) {
    if (!Number.isFinite(n)) return '0';
    return Math.round(n).toLocaleString('en-US');
}

function formatUsd(n) {
    if (!Number.isFinite(n)) return '0';
    if (n !== 0 && Math.abs(n) < 0.01) {
        return n.toFixed(6).replace(/\.?0+$/, '');
    }
    return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function plainNumber(n, maxDecimals = 2) {
    if (!Number.isFinite(n) || n === 0) return '';
    const fixed = n.toFixed(maxDecimals);
    return fixed.includes('.') ? fixed.replace(/\.?0+$/, '') : fixed;
}

export default function SatsConverter() {
    const [btcPrice, setBtcPrice] = useState(null);
    const [field, setField] = useState('usd');
    const [value, setValue] = useState('100');

    useEffect(() => {
        const controller = new AbortController();

        const fetchPrice = () => {
            fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT', { signal: controller.signal })
                .then(res => res.ok ? res.json() : null)
                .then(data => {
                    const p = data && parseFloat(data.price);
                    if (p && !Number.isNaN(p)) setBtcPrice(p);
                })
                .catch(err => {
                    if (err.name !== 'AbortError') console.log('SatsConverter price fetch failed:', err.message);
                });
        };

        fetchPrice();
        const interval = setInterval(fetchPrice, 5000);
        return () => {
            controller.abort();
            clearInterval(interval);
        };
    }, []);

    const parsed = parseFloat(value);
    const safeNum = Number.isFinite(parsed) ? parsed : 0;
    const price = btcPrice ?? 0;

    let btc, sats, usd;
    if (field === 'btc') {
        btc = safeNum;
        sats = safeNum * 1e8;
        usd = safeNum * price;
    } else if (field === 'sats') {
        sats = safeNum;
        btc = safeNum / 1e8;
        usd = (safeNum / 1e8) * price;
    } else {
        usd = safeNum;
        btc = price ? safeNum / price : 0;
        sats = price ? (safeNum / price) * 1e8 : 0;
    }

    const displayBtc = field === 'btc' ? value : formatBtc(btc);
    const displaySats = field === 'sats' ? value : formatSats(sats);
    const displayUsd = field === 'usd' ? value : formatUsd(usd);

    const handleChange = (f) => (e) => {
        const raw = e.target.value.replace(/,/g, '');
        if (raw === '' || /^\d*\.?\d*$/.test(raw)) {
            setField(f);
            setValue(raw);
        }
    };

    const handleFocus = (f) => () => {
        if (field === f) return;
        let next;
        if (f === 'btc') next = plainNumber(btc, 8);
        else if (f === 'sats') next = sats > 0 ? String(Math.round(sats)) : '';
        else next = plainNumber(usd, 2);
        setField(f);
        setValue(next);
    };

    const handlePreset = (preset) => {
        setField(preset.field);
        setValue(preset.value);
    };

    const oneSatUsd = price / 1e8;
    const oneSatDisplay = btcPrice
        ? oneSatUsd < 0.01
            ? `$${oneSatUsd.toFixed(6).replace(/\.?0+$/, '')}`
            : `$${oneSatUsd.toFixed(2)}`
        : '—';

    return (
        <div className="page-content sc-page">
            <PageMeta title="Sats Converter" description="Convert between satoshis, BTC, and USD with live pricing — three linked inputs that update each other in real time." />
            <div className="sc-header">
                <div className="sc-hero-glow" />
                <div className="sc-btc-watermark">₿</div>
                <div className="sc-header-content">
                    <p className="sc-eyebrow">
                        <Zap size={14} strokeWidth={2.5} />
                        Bitcoin Unit Tool
                    </p>
                    <h1 className="sc-title"><span>Sats</span> Converter</h1>
                    <p className="sc-subtitle">
                        Instantly convert between BTC, satoshis, and US dollars using live Binance prices.
                        One bitcoin splits into 100 million sats — the smallest unit on the Bitcoin network.
                    </p>
                </div>
            </div>

            <div className="sc-price-badge" aria-live="polite">
                <span className="sc-live-dot" aria-hidden="true" />
                <span className="sc-price-badge-label">Live BTC price</span>
                <span className="sc-price-badge-value">
                    {btcPrice != null
                        ? `$${btcPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        : 'Connecting…'}
                </span>
            </div>

            <div className="sc-converter">
                <div className="sc-field">
                    <label className="sc-label" htmlFor="sc-btc">Bitcoin</label>
                    <div className="sc-input-wrap">
                        <span className="sc-input-prefix">₿</span>
                        <input
                            id="sc-btc"
                            type="text"
                            inputMode="decimal"
                            className="sc-input sc-input--prefixed"
                            value={displayBtc}
                            onChange={handleChange('btc')}
                            onFocus={handleFocus('btc')}
                            placeholder="0"
                            autoComplete="off"
                            aria-label="Bitcoin amount"
                        />
                    </div>
                    <span className="sc-field-hint">BTC</span>
                </div>

                <div className="sc-equals" aria-hidden="true">=</div>

                <div className="sc-field">
                    <label className="sc-label" htmlFor="sc-sats">Satoshis</label>
                    <div className="sc-input-wrap">
                        <input
                            id="sc-sats"
                            type="text"
                            inputMode="numeric"
                            className="sc-input"
                            value={displaySats}
                            onChange={handleChange('sats')}
                            onFocus={handleFocus('sats')}
                            placeholder="0"
                            autoComplete="off"
                            aria-label="Satoshi amount"
                        />
                    </div>
                    <span className="sc-field-hint">sats</span>
                </div>

                <div className="sc-equals" aria-hidden="true">=</div>

                <div className="sc-field">
                    <label className="sc-label" htmlFor="sc-usd">US Dollars</label>
                    <div className="sc-input-wrap">
                        <span className="sc-input-prefix">$</span>
                        <input
                            id="sc-usd"
                            type="text"
                            inputMode="decimal"
                            className="sc-input sc-input--prefixed"
                            value={btcPrice ? displayUsd : ''}
                            onChange={handleChange('usd')}
                            onFocus={handleFocus('usd')}
                            placeholder={btcPrice ? '0.00' : 'Waiting for price…'}
                            autoComplete="off"
                            disabled={!btcPrice}
                            aria-label="US dollar amount"
                        />
                    </div>
                    <span className="sc-field-hint">USD</span>
                </div>
            </div>

            <div className="sc-presets">
                <span className="sc-presets-label">Quick amounts</span>
                <div className="sc-presets-row">
                    {PRESETS.map(p => (
                        <button
                            key={p.label}
                            type="button"
                            className="sc-preset"
                            onClick={() => handlePreset(p)}
                        >
                            <span className="sc-preset-label">{p.label}</span>
                            {p.hint && <span className="sc-preset-hint">{p.hint}</span>}
                        </button>
                    ))}
                </div>
            </div>

            <div className="sc-reference">
                <div className="sc-reference-row">
                    <span className="sc-reference-label">1 BTC</span>
                    <span className="sc-reference-value">= 100,000,000 sats</span>
                </div>
                <div className="sc-reference-row">
                    <span className="sc-reference-label">1 sat</span>
                    <span className="sc-reference-value">≈ {oneSatDisplay}</span>
                </div>
                <div className="sc-reference-row">
                    <span className="sc-reference-label">Total supply cap</span>
                    <span className="sc-reference-value">21,000,000 BTC</span>
                </div>
            </div>

            <p className="sc-disclaimer">
                Prices refresh every 5 seconds from Binance. This tool is for educational purposes only.
            </p>
        </div>
    );
}
