import { useFearGreed, getSentimentKey } from "../../hooks/queries/useMarketData";

const toRad = (deg: number) => (deg * Math.PI) / 180;

interface GaugeArcProps {
    value: number;
}

function GaugeArc({ value }: GaugeArcProps) {
    const radius = 54;
    const cx = 80;
    const cy = 72;

    const arcPoint = (angle: number) => ({
        x: cx + radius * Math.cos(toRad(angle)),
        y: cy + radius * Math.sin(toRad(angle)),
    });

    const start = arcPoint(-180);
    const end = arcPoint(0);
    const valueAngle = -180 + (value / 100) * 180;
    const marker = arcPoint(valueAngle);
    const sentimentKey = getSentimentKey(value);

    const bgArc = `M ${start.x} ${start.y} A ${radius} ${radius} 0 0 1 ${end.x} ${end.y}`;
    const fillArc = `M ${start.x} ${start.y} A ${radius} ${radius} 0 0 1 ${marker.x} ${marker.y}`;

    return (
        <svg viewBox="0 0 160 90" className="fg-gauge-svg" aria-hidden="true">
            <path d={bgArc} fill="none" className="fg-arc-bg" strokeWidth="10" strokeLinecap="round" />
            <path d={fillArc} fill="none" className={`fg-arc-fill fg-arc-fill--${sentimentKey}`} strokeWidth="10" strokeLinecap="round" />
            <circle cx={marker.x} cy={marker.y} r="6.5" className="fg-marker-ring" />
            <circle cx={marker.x} cy={marker.y} r="3.5" className={`fg-marker fg-marker--${sentimentKey}`} />
            <text x={cx} y={cy - 8} textAnchor="middle" className="fg-gauge-number">{value}</text>
        </svg>
    );
}

export default function FearGreedWidget() {
    const { data, isPending } = useFearGreed();

    if (isPending) {
        return (
            <div className="fg-widget">
                <span className="fg-loading">Loading index...</span>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="fg-widget">
                <span className="fg-loading">Index unavailable</span>
            </div>
        );
    }

    const sentimentKey = getSentimentKey(data.value);

    return (
        <div className="fg-widget">
            <p className="fg-title">Fear &amp; Greed Index</p>
            <div className="fg-gauge-wrap">
                <GaugeArc value={data.value} />
            </div>
            <p className={`fg-sentiment fg-sentiment--${sentimentKey}`}>{data.label}</p>
        </div>
    );
}
