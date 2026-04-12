import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { FEE_TIERS } from '../../utils/mempoolHelpers';

export default function MempoolInfoModal({ onClose }) {
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
        <div className="mempool-info-overlay" onClick={onClose}>
            <div
                className="mempool-info-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="mempool-info-title"
                onClick={e => e.stopPropagation()}
            >

                <div className="mempool-info-header">
                    <h2 className="mempool-info-title" id="mempool-info-title">How the Mempool Works</h2>
                    <button className="mempool-info-close" ref={closeRef} onClick={onClose} aria-label="Close">
                        <X size={18} strokeWidth={2.25} />
                    </button>
                </div>

                <div className="mempool-info-body">

                    <section className="mempool-info-section">
                        <h3 className="mempool-info-section-title">What is the Mempool?</h3>
                        <p className="mempool-info-text">
                            When you send Bitcoin, your transaction doesn't confirm instantly.
                            It first enters the <strong>memory pool</strong> — a global waiting room of unconfirmed transactions.
                            Miners select transactions from this pool to fill the next block,
                            always prioritising those offering the highest fee per virtual byte (sat/vB).
                        </p>
                    </section>

                    <section className="mempool-info-section">
                        <h3 className="mempool-info-section-title">Reading the Bubbles</h3>
                        <p className="mempool-info-text">
                            Each bubble represents a recent unconfirmed transaction broadcast to the network.
                        </p>
                        <div className="mempool-info-bubbles-legend">
                            <div className="mempool-info-bubble-rule">
                                <span className="mempool-info-bubble-icon mempool-info-bubble-icon--large">◉</span>
                                <span>Larger bubble = higher fee rate = gets confirmed faster</span>
                            </div>
                            <div className="mempool-info-bubble-rule">
                                <span className="mempool-info-bubble-icon mempool-info-bubble-icon--color">◉</span>
                                <span>Color = urgency tier (see table below)</span>
                            </div>
                            <div className="mempool-info-bubble-rule">
                                <span className="mempool-info-bubble-icon">◎</span>
                                <span>Number inside = fee rate in sat/vB</span>
                            </div>
                        </div>
                    </section>

                    <section className="mempool-info-section">
                        <h3 className="mempool-info-section-title">Fee Tiers</h3>
                        <div className="mempool-info-tiers">
                            {FEE_TIERS.map(tier => (
                                <div key={tier.key} className="mempool-info-tier-row">
                                    <span className={`mempool-legend-dot mempool-legend-dot--${tier.key}`} />
                                    <span className="mempool-info-tier-label">{tier.label}</span>
                                    <span className="mempool-info-tier-desc">{tier.description}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="mempool-info-section">
                        <h3 className="mempool-info-section-title">Stats Explained</h3>
                        <div className="mempool-info-stats">
                            <div className="mempool-info-stat-row">
                                <span className="mempool-info-stat-name">Pending Transactions</span>
                                <span className="mempool-info-stat-desc">Total unconfirmed transactions currently waiting in the mempool.</span>
                            </div>
                            <div className="mempool-info-stat-row">
                                <span className="mempool-info-stat-name">Mempool Size</span>
                                <span className="mempool-info-stat-desc">Total data size of all pending transactions. A full mempool means higher competition and fees.</span>
                            </div>
                            <div className="mempool-info-stat-row">
                                <span className="mempool-info-stat-name">Total Fees Waiting</span>
                                <span className="mempool-info-stat-desc">Combined fees miners will collect once all pending transactions are confirmed.</span>
                            </div>
                            <div className="mempool-info-stat-row">
                                <span className="mempool-info-stat-name">Next Block Fee</span>
                                <span className="mempool-info-stat-desc">Minimum fee rate needed to likely be included in the very next block (~10 min).</span>
                            </div>
                            <div className="mempool-info-stat-row">
                                <span className="mempool-info-stat-name">~30 Min Fee</span>
                                <span className="mempool-info-stat-desc">Fee rate for confirmation within roughly 30 minutes (2–3 blocks).</span>
                            </div>
                            <div className="mempool-info-stat-row">
                                <span className="mempool-info-stat-name">Economy Fee</span>
                                <span className="mempool-info-stat-desc">Lowest fee rate currently being processed. Suitable when time is not a concern.</span>
                            </div>
                        </div>
                    </section>

                    <section className="mempool-info-section mempool-info-section--last">
                        <h3 className="mempool-info-section-title">Refresh Rate</h3>
                        <p className="mempool-info-text">
                            Stats and fees update every <strong>30 seconds</strong>.
                            New transactions are added to the visualization every <strong>5 seconds</strong>.
                            All data is sourced from the public <strong>mempool.space</strong> API.
                        </p>
                    </section>

                </div>
            </div>
        </div>
    );
}
