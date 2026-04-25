import { useState, useMemo, useEffect, useRef } from 'react';
import { ExternalLink, Search, X, Sparkles, CircleAlert, Info, Clipboard } from 'lucide-react';
import { detectAddressType, getMempoolUrl } from '../../utils/addressTypes';
import AddressInfoModal from '../address-info-modal/AddressInfoModal';
import PageMeta from '../page-meta/PageMeta';

const SAMPLE_ADDRESSES = [
    { label: 'Legacy', value: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa' },
    { label: 'P2SH', value: '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy' },
    { label: 'SegWit', value: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq' },
    { label: 'Taproot', value: 'bc1p5d7rjq7g6rdk2yhzks9smlaqtedr4dekq08ge8ztwac72sfr9rusxg3297' },
];

export default function AddressDemystifier() {
    const [raw, setRaw] = useState('');
    const [showInfo, setShowInfo] = useState(false);
    const inputRef = useRef(null);
    const trimmed = raw.trim();
    const detection = useMemo(() => detectAddressType(trimmed), [trimmed]);
    const mempoolUrl = detection ? getMempoolUrl(detection) : null;

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    return (
        <section className="page-content address-page">
            <PageMeta title="Address Demystifier" description="Identify Bitcoin address formats — Legacy, P2SH, SegWit, and Taproot — and learn what each one means." />
            <div className="address-header">
                <div className="address-hero-glow" />
                <div className="address-btc-watermark">₿</div>
                <div className="address-header-content">
                    <span className="address-eyebrow">
                        <Sparkles size={12} strokeWidth={2.75} />
                        Tool
                    </span>
                    <h1 className="address-title">Address Demystifier</h1>
                    <p className="address-subtitle">
                        Paste any Bitcoin address to identify its type, learn what it means,
                        and view it on the block explorer.
                    </p>
                    <button
                        type="button"
                        className="address-info-btn"
                        onClick={() => setShowInfo(true)}
                    >
                        <Info size={14} strokeWidth={2.25} />
                        About Bitcoin addresses
                    </button>
                </div>
            </div>

            {showInfo && <AddressInfoModal onClose={() => setShowInfo(false)} />}

            <div className="address-input-card">
                <div className="address-input-wrapper">
                    <Search size={16} strokeWidth={2.25} className="address-input-icon" />
                    <input
                        ref={inputRef}
                        type="text"
                        className="address-input"
                        placeholder="Paste a Bitcoin address (1..., 3..., bc1..., lnbc...)"
                        value={raw}
                        onChange={(e) => setRaw(e.target.value)}
                        spellCheck={false}
                        autoComplete="off"
                        autoCapitalize="off"
                        autoCorrect="off"
                    />
                    {raw && (
                        <button
                            type="button"
                            className="address-input-clear"
                            onClick={() => setRaw('')}
                            aria-label="Clear input"
                        >
                            <X size={14} strokeWidth={2.75} />
                        </button>
                    )}
                </div>

                <div className="address-input-hint">
                    <Clipboard size={12} strokeWidth={2.25} />
                    <span>Tip: press <kbd>Ctrl</kbd>+<kbd>V</kbd> to paste from your clipboard</span>
                </div>

                <div className="address-samples">
                    <span className="address-samples-label">Try an example:</span>
                    {SAMPLE_ADDRESSES.map(sample => (
                        <button
                            key={sample.label}
                            type="button"
                            className="address-sample-btn"
                            onClick={() => setRaw(sample.value)}
                        >
                            {sample.label}
                        </button>
                    ))}
                </div>
            </div>

            {!detection && trimmed.length > 0 && (
                <div className="address-result address-result--typing">
                    <p className="address-result-description">
                        Keep typing — addresses are at least 4 characters.
                    </p>
                </div>
            )}

            {!detection && trimmed.length === 0 && (
                <div className="address-empty">
                    <CircleAlert size={20} strokeWidth={2} />
                    <p>Paste an address above to begin, or try one of the examples.</p>
                </div>
            )}

            {detection && (
                <article className={`address-result address-result--${detection.type.id.toLowerCase()}`}>
                    <header className="address-result-head">
                        <span className="address-result-label">Detected type</span>
                        <h2 className="address-result-name">{detection.type.name}</h2>
                        <p className="address-result-fullname">{detection.type.fullName}</p>
                    </header>

                    <div className="address-result-value" aria-label="Address">
                        {detection.input}
                    </div>

                    <div className="address-result-facts">
                        <div className="address-fact">
                            <span className="address-fact-label">Introduced</span>
                            <span className="address-fact-value">{detection.type.introduced}</span>
                        </div>
                        <div className="address-fact">
                            <span className="address-fact-label">Encoding</span>
                            <span className="address-fact-value">{detection.type.encoding}</span>
                        </div>
                        <div className="address-fact">
                            <span className="address-fact-label">Network</span>
                            <span className="address-fact-value">{detection.type.network}</span>
                        </div>
                        <div className="address-fact">
                            <span className="address-fact-label">Length</span>
                            <span className="address-fact-value">{detection.input.length} chars</span>
                        </div>
                    </div>

                    <p className="address-result-description">{detection.type.description}</p>

                    {detection.type.characteristics.length > 0 && (
                        <ul className="address-result-characteristics">
                            {detection.type.characteristics.map((c, i) => (
                                <li key={i}>{c}</li>
                            ))}
                        </ul>
                    )}

                    {mempoolUrl && (
                        <a
                            href={mempoolUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="address-mempool-btn"
                        >
                            View on mempool.space
                            <ExternalLink size={14} strokeWidth={2.25} />
                        </a>
                    )}
                </article>
            )}
        </section>
    );
}
