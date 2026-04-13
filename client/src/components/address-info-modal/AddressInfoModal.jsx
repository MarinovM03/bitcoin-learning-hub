import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { ADDRESS_TYPES } from '../../utils/addressTypes';

const FORMAT_ROWS = [
    { type: ADDRESS_TYPES.LEGACY, prefix: '1...' },
    { type: ADDRESS_TYPES.P2SH, prefix: '3...' },
    { type: ADDRESS_TYPES.P2WPKH, prefix: 'bc1q... (42)' },
    { type: ADDRESS_TYPES.P2WSH, prefix: 'bc1q... (62)' },
    { type: ADDRESS_TYPES.P2TR, prefix: 'bc1p...' },
    { type: ADDRESS_TYPES.LIGHTNING, prefix: 'lnbc...' },
    { type: ADDRESS_TYPES.TESTNET, prefix: 'm / n / 2 / tb1...' },
];

export default function AddressInfoModal({ onClose }) {
    const closeRef = useRef(null);

    useEffect(() => {
        closeRef.current?.focus();

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    return (
        <div className="address-info-overlay" onClick={onClose}>
            <div
                className="address-info-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="address-info-title"
                onClick={e => e.stopPropagation()}
            >
                <div className="address-info-header">
                    <h2 className="address-info-title" id="address-info-title">
                        About Bitcoin Addresses
                    </h2>
                    <button
                        className="address-info-close"
                        ref={closeRef}
                        onClick={onClose}
                        aria-label="Close"
                    >
                        <X size={18} strokeWidth={2.25} />
                    </button>
                </div>

                <div className="address-info-body">
                    <section className="address-info-section">
                        <h3 className="address-info-section-title">What is a Bitcoin address?</h3>
                        <p className="address-info-text">
                            A Bitcoin address is a short string derived from a <strong>public key</strong>
                            (or a script). It's where you send Bitcoin. Bitcoin itself lives on the blockchain as
                            unspent transaction outputs — the address is just a human-friendly pointer the
                            network uses to decide who can spend those outputs next.
                        </p>
                        <p className="address-info-text">
                            Over Bitcoin's history, several address formats have been introduced. Each one brings
                            tradeoffs in <strong>compatibility</strong>, <strong>transaction fees</strong>,
                            and <strong>privacy</strong>. This tool tells you which format you're looking at
                            and explains what that means in practice.
                        </p>
                    </section>

                    <section className="address-info-section">
                        <h3 className="address-info-section-title">Every format at a glance</h3>
                        <div className="address-info-formats">
                            <div className="address-info-formats-head">
                                <span>Type</span>
                                <span>Prefix</span>
                                <span>Since</span>
                                <span>Encoding</span>
                            </div>
                            {FORMAT_ROWS.map(row => (
                                <div key={row.type.id} className="address-info-format-row">
                                    <span className="address-info-format-name">{row.type.name}</span>
                                    <span className="address-info-format-prefix">{row.prefix}</span>
                                    <span className="address-info-format-year">{row.type.introduced}</span>
                                    <span className="address-info-format-encoding">{row.type.encoding}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="address-info-section">
                        <h3 className="address-info-section-title">Encoding formats explained</h3>
                        <div className="address-info-stats">
                            <div className="address-info-stat-row">
                                <span className="address-info-stat-name">Base58Check</span>
                                <span className="address-info-stat-desc">
                                    A base-58 alphabet (digits, upper and lowercase letters, minus the lookalikes
                                    <code>0</code>, <code>O</code>, <code>I</code>, <code>l</code>) plus a 4-byte
                                    double-SHA256 checksum. Used by Legacy and P2SH. Case-sensitive.
                                </span>
                            </div>
                            <div className="address-info-stat-row">
                                <span className="address-info-stat-name">Bech32</span>
                                <span className="address-info-stat-desc">
                                    Lowercase-only format introduced with SegWit in 2017 (BIP-173). Its checksum
                                    is much better at catching typos than Base58, and the restricted alphabet
                                    makes addresses easier to read aloud. Used by <code>bc1q...</code> addresses.
                                </span>
                            </div>
                            <div className="address-info-stat-row">
                                <span className="address-info-stat-name">Bech32m</span>
                                <span className="address-info-stat-desc">
                                    A fix for a subtle flaw in the original Bech32 checksum (BIP-350). Used by
                                    Taproot <code>bc1p...</code> addresses from 2021 onward.
                                </span>
                            </div>
                        </div>
                    </section>

                    <section className="address-info-section">
                        <h3 className="address-info-section-title">Fees and address choice</h3>
                        <p className="address-info-text">
                            SegWit and Taproot transactions are cheaper to send because the witness data (signatures)
                            is discounted when computing fees. Typically you'll pay roughly
                            <strong> 30–40% less</strong> from a <code>bc1q...</code> address compared to a
                            <code> 1...</code> Legacy address for the same transaction.
                        </p>
                        <p className="address-info-text">
                            You can always send Bitcoin <em>to</em> any address format from any other format —
                            the savings only apply to the inputs being spent.
                        </p>
                    </section>

                    <section className="address-info-section">
                        <h3 className="address-info-section-title">What about Lightning?</h3>
                        <p className="address-info-text">
                            Lightning invoices (<code>lnbc...</code>) are <strong>not on-chain addresses</strong>.
                            They're payment requests for the Lightning Network, a second-layer system that settles
                            Bitcoin payments off-chain for near-instant confirmation and near-zero fees. Lightning
                            invoices usually expire within minutes to a few hours and can only be paid once.
                        </p>
                    </section>

                    <section className="address-info-section">
                        <h3 className="address-info-section-title">How this tool works</h3>
                        <p className="address-info-text">
                            Detection is based on the address's <strong>prefix</strong> and <strong>length</strong>.
                            This identifies the format reliably, but does <em>not</em> cryptographically verify the
                            checksum — a typo that still matches the pattern will still be classified as a real
                            address. For actual on-chain verification, use your wallet or a block explorer.
                        </p>
                    </section>

                    <section className="address-info-section address-info-section--last">
                        <h3 className="address-info-section-title">About mempool.space</h3>
                        <p className="address-info-text">
                            <strong>mempool.space</strong> is an open-source Bitcoin block explorer. The
                            "View on mempool.space" button takes you to the address's page on that explorer, where
                            you can see its full transaction history, balance, and any unconfirmed activity. Runs
                            on its own Bitcoin node — no tracking, no account required.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
