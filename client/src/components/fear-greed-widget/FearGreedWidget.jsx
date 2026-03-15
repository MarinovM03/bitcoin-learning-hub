import { useEffect, useState } from "react";

const toRad = (deg) => (deg * Math.PI) / 180;

function getSentimentKey(value) {
    if (value <= 25) return "extreme-fear";
    if (value <= 45) return "fear";
    if (value <= 55) return "neutral";
    if (value <= 75) return "greed";
    return "extreme-greed";
}

function GaugeArc({ value }) {
    const radius = 54;
    const cx = 80;
    const cy = 72;

    const arcPoint = (angle) => ({
        x: cx + radius * Math.cos(toRad(angle)),
        y: cy + radius * Math.sin(toRad(angle)),
    });

    const start = arcPoint(-180);
    const end = arcPoint(0);
    const valueAngle = -180 + (value / 100) * 180;
    const valueEnd = arcPoint(valueAngle);
    const largeArc = valueAngle > -90 ? 1 : 0;
    const sentimentKey = getSentimentKey(value);

    const bgArc = `M ${start.x} ${start.y} A ${radius} ${radius} 0 0 1 ${end.x} ${end.y}`;
    const fillArc = `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${valueEnd.x} ${valueEnd.y}`;
    const needleTip = arcPoint(valueAngle);

    return (
        <svg viewBox="0 0 160 90" className="fg-gauge-svg" aria-hidden="true">
            <path d={bgArc} fill="none" className="fg-arc-bg" strokeWidth="10" strokeLinecap="round" />
            <path d={fillArc} fill="none" className={`fg-arc-fill fg-arc-fill--${sentimentKey}`} strokeWidth="10" strokeLinecap="round" />
            <line
                x1={cx} y1={cy}
                x2={needleTip.x} y2={needleTip.y}
                className={`fg-needle fg-needle--${sentimentKey}`}
                strokeWidth="2.5"
                strokeLinecap="round"
            />
            <circle cx={cx} cy={cy} r="4" className={`fg-needle-dot fg-needle-dot--${sentimentKey}`} />
            <text x={cx} y={cy - 12} textAnchor="middle" className="fg-gauge-number">{value}</text>
        </svg>
    );
}

export default function FearGreedWidget() {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch("https://api.alternative.me/fng/")
            .then(res => res.json())
            .then(json => {
                const entry = json.data[0];
                setData({
                    value: parseInt(entry.value, 10),
                    label: entry.value_classification,
                });
            })
            .catch(err => console.error("Fear & Greed fetch failed:", err))
            .finally(() => setIsLoading(false));
    }, []);

    if (isLoading) {
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