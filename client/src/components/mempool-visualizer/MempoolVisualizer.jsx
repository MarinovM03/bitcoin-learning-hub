import { useRef, useEffect, useState } from 'react';
import Spinner from '../spinner/Spinner';
import MempoolInfoModal from '../mempool-info-modal/MempoolInfoModal';
import {
    FEE_TIERS,
    MAX_BUBBLES,
    CANVAS_HEIGHT,
    REFRESH_STATS,
    REFRESH_TXS,
    buildBubble,
    formatSats,
    formatMempoolSize,
    formatFeeRate,
    formatTotalFees,
    fetchMempoolStats,
    fetchRecentTxs,
    fetchRecommendedFees,
} from '../../utils/mempoolHelpers';

export default function MempoolVisualizer() {
    const canvasRef = useRef(null);
    const bubblesRef = useRef([]);
    const animRef = useRef(null);
    const seenRef = useRef(new Set());

    const [stats, setStats] = useState(null);
    const [fees, setFees] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [hovered, setHovered] = useState(null);
    const [tipPos, setTipPos] = useState({ x: 0, y: 0 });
    const [showInfo, setShowInfo] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const resize = () => {
            canvas.width  = canvas.offsetWidth;
            canvas.height = CANVAS_HEIGHT;
        };
        resize();
        const ro = new ResizeObserver(resize);
        ro.observe(canvas);

        const loop = () => {
            animRef.current = requestAnimationFrame(loop);
            const w = canvas.width;
            const h = canvas.height;

            if (w === 0 || h === 0) return;

            ctx.clearRect(0, 0, w, h);

            const bg = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.65);
            bg.addColorStop(0, 'rgba(247, 147, 26, 0.03)');
            bg.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, w, h);

            bubblesRef.current = bubblesRef.current.filter(b => {
                if (b.opacity < 1) b.opacity = Math.min(1, b.opacity + 0.012);

                b.phase += 0.007;
                b.x += b.vx + Math.sin(b.phase) * 0.18;
                b.y += b.vy;

                if (b.x - b.radius < 0) { b.x = b.radius;     b.vx =  Math.abs(b.vx); }
                if (b.x + b.radius > w) { b.x = w - b.radius; b.vx = -Math.abs(b.vx); }

                if (b.y - b.radius < 50) b.opacity = Math.max(0, b.opacity - 0.018);

                return b.y + b.radius > 0 && b.opacity > 0;
            });

            for (const b of bubblesRef.current) {
                ctx.save();
                ctx.globalAlpha = b.opacity;

                ctx.shadowColor = b.color;
                ctx.shadowBlur  = b.hovered ? 28 : 14;

                ctx.beginPath();
                ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
                ctx.fillStyle = b.color + (b.hovered ? '44' : '22');
                ctx.fill();

                ctx.strokeStyle = b.color;
                ctx.lineWidth   = b.hovered ? 2.5 : 1.5;
                ctx.stroke();

                if (b.radius >= 22) {
                    ctx.shadowBlur   = 0;
                    ctx.fillStyle    = 'rgba(255,255,255,0.88)';
                    const fs         = Math.max(9, Math.floor(b.radius * 0.36));
                    ctx.font         = `700 ${fs}px monospace`;
                    ctx.textAlign    = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(Math.round(b.feeRate) + 's', b.x, b.y);
                }

                ctx.restore();
            }
        };

        animRef.current = requestAnimationFrame(loop);
        return () => {
            cancelAnimationFrame(animRef.current);
            ro.disconnect();
        };
    }, []);

    const addBubbles = (txs) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const w = canvas.width;

        const txFees = txs.map(tx => tx.fee);
        const minFee = Math.min(...txFees);
        const maxFee = Math.max(...txFees);
        const slots  = MAX_BUBBLES - bubblesRef.current.length;
        if (slots <= 0) return;

        const fresh = [];
        for (const tx of txs) {
            if (fresh.length >= slots) break;
            if (seenRef.current.has(tx.txid)) continue;
            seenRef.current.add(tx.txid);
            fresh.push(buildBubble(tx, w, CANVAS_HEIGHT, minFee, maxFee));
        }
        bubblesRef.current = [...bubblesRef.current, ...fresh];
    };

    useEffect(() => {
        const loadAll = async () => {
            try {
                const [statsData, txsData, feesData] = await Promise.all([
                    fetchMempoolStats(),
                    fetchRecentTxs(),
                    fetchRecommendedFees(),
                ]);
                setStats(statsData);
                setFees(feesData);
                addBubbles(txsData);
            } catch {
                setError('Could not connect to mempool.space. Check your connection and try refreshing.');
            } finally {
                setLoading(false);
            }
        };

        loadAll();

        const statsTimer = setInterval(async () => {
            try {
                const [statsData, feesData] = await Promise.all([fetchMempoolStats(), fetchRecommendedFees()]);
                setStats(statsData);
                setFees(feesData);
            } catch {}
        }, REFRESH_STATS);

        const txTimer = setInterval(async () => {
            try {
                const txs = await fetchRecentTxs();
                addBubbles(txs);
            } catch {}
        }, REFRESH_TXS);

        return () => {
            clearInterval(statsTimer);
            clearInterval(txTimer);
        };
    }, []);

    const handleMouseMove = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        let found = null;
        for (const b of [...bubblesRef.current].reverse()) {
            const dx = b.x - mx;
            const dy = b.y - my;
            if (Math.sqrt(dx * dx + dy * dy) <= b.radius) { found = b; break; }
        }

        bubblesRef.current.forEach(b => { b.hovered = b === found; });
        setHovered(found ? { ...found } : null);
        if (found) setTipPos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseLeave = () => {
        bubblesRef.current.forEach(b => { b.hovered = false; });
        setHovered(null);
    };

    return (
        <div className="page-content mempool-page">
            <div className="mempool-header">
                <div className="mempool-hero-glow" />
                <div className="mempool-btc-watermark">₿</div>
                <div className="mempool-header-content">
                    <p className="mempool-eyebrow">⛓ Live Bitcoin Network</p>
                    <h1 className="mempool-title">Mempool <span>Visualizer</span></h1>
                    <p className="mempool-subtitle">
                        Watch unconfirmed Bitcoin transactions float through the mempool in real time.
                        Bubble size and color reflect the fee rate — higher fee means faster confirmation.
                    </p>
                    <button className="mempool-info-btn" onClick={() => setShowInfo(true)}>
                        ⓘ How it works
                    </button>
                </div>
            </div>

            {showInfo && <MempoolInfoModal onClose={() => setShowInfo(false)} />}

            {loading && (
                <div className="mempool-loading">
                    <Spinner />
                    <p className="mempool-loading-text">Connecting to Bitcoin mempool...</p>
                </div>
            )}

            {error && !loading && (
                <div className="mempool-error">
                    <span>⚠</span> {error}
                </div>
            )}

            {!loading && !error && stats && fees && (
                <div className="mempool-stats-grid">
                    <div className="mempool-stat-card">
                        <span className="mempool-stat-label">Pending Transactions</span>
                        <span className="mempool-stat-value">{stats.count.toLocaleString()}</span>
                    </div>
                    <div className="mempool-stat-card">
                        <span className="mempool-stat-label">Mempool Size</span>
                        <span className="mempool-stat-value">{formatMempoolSize(stats.vsize)}</span>
                    </div>
                    <div className="mempool-stat-card">
                        <span className="mempool-stat-label">Total Fees Waiting</span>
                        <span className="mempool-stat-value mempool-stat--orange">{formatTotalFees(stats.total_fee)}</span>
                    </div>
                    <div className="mempool-stat-card">
                        <span className="mempool-stat-label">Next Block Fee</span>
                        <span className="mempool-stat-value mempool-stat--red">{formatFeeRate(fees.fastestFee)}</span>
                    </div>
                    <div className="mempool-stat-card">
                        <span className="mempool-stat-label">~30 Min Fee</span>
                        <span className="mempool-stat-value mempool-stat--yellow">{formatFeeRate(fees.halfHourFee)}</span>
                    </div>
                    <div className="mempool-stat-card">
                        <span className="mempool-stat-label">Economy Fee</span>
                        <span className="mempool-stat-value mempool-stat--blue">{formatFeeRate(fees.economyFee)}</span>
                    </div>
                </div>
            )}

            {!error && (
                <div className="mempool-canvas-card">
                    <div className="mempool-canvas-header">
                        <div className="mempool-legend">
                            {FEE_TIERS.map(tier => (
                                <div key={tier.key} className="mempool-legend-item">
                                    <span className={`mempool-legend-dot mempool-legend-dot--${tier.key}`} />
                                    <span className="mempool-legend-label">{tier.label}</span>
                                </div>
                            ))}
                        </div>
                        {!loading && <span className="mempool-live-badge">● Live</span>}
                    </div>

                    <canvas
                        ref={canvasRef}
                        className="mempool-canvas"
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                    />

                    <p className="mempool-canvas-footer">
                        Showing recent unconfirmed transactions · refreshes every 5s · hover a bubble for details
                    </p>
                </div>
            )}

            {hovered && (
                <div
                    className="mempool-tooltip"
                    style={{ '--tip-x': tipPos.x + 'px', '--tip-y': tipPos.y + 'px' }}
                >
                    <p className="mempool-tooltip-txid">{hovered.txid.slice(0, 20)}…</p>
                    <div className="mempool-tooltip-row">
                        <span>Fee Rate</span>
                        <span className="mempool-tooltip-highlight">{formatFeeRate(hovered.feeRate)}</span>
                    </div>
                    <div className="mempool-tooltip-row">
                        <span>Fee Paid</span>
                        <span>{formatSats(hovered.fee)}</span>
                    </div>
                    {hovered.value > 0 && (
                        <div className="mempool-tooltip-row">
                            <span>Value</span>
                            <span>{formatSats(hovered.value)}</span>
                        </div>
                    )}
                    <div className="mempool-tooltip-row">
                        <span>Size</span>
                        <span>{hovered.vsize} vB</span>
                    </div>
                </div>
            )}
        </div>
    );
}
