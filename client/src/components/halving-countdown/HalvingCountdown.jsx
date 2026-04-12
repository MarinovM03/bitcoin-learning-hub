import { useEffect, useState } from "react";
import { Pickaxe } from "lucide-react";

// Next halving estimated around April 2028
const NEXT_HALVING_DATE = new Date("2028-04-18T00:00:00Z");

function getTimeLeft() {
    const diff = NEXT_HALVING_DATE - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
        days:    Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours:   Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
    };
}

export default function HalvingCountdown() {
    const [timeLeft, setTimeLeft] = useState(getTimeLeft());

    useEffect(() => {
        const timer = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
        return () => clearInterval(timer);
    }, []);

    const pad = (n) => String(n).padStart(2, '0');

    return (
        <div className="halving-section">
            <p className="halving-label">
                <Pickaxe size={14} strokeWidth={2.25} />
                Next Bitcoin Halving
            </p>
            <div className="halving-timer">
                <div className="halving-unit">
                    <span className="halving-number">{timeLeft.days}</span>
                    <span className="halving-text">Days</span>
                </div>
                <span className="halving-colon">:</span>
                <div className="halving-unit">
                    <span className="halving-number">{pad(timeLeft.hours)}</span>
                    <span className="halving-text">Hours</span>
                </div>
                <span className="halving-colon">:</span>
                <div className="halving-unit">
                    <span className="halving-number">{pad(timeLeft.minutes)}</span>
                    <span className="halving-text">Minutes</span>
                </div>
                <span className="halving-colon">:</span>
                <div className="halving-unit">
                    <span className="halving-number">{pad(timeLeft.seconds)}</span>
                    <span className="halving-text">Seconds</span>
                </div>
            </div>
            <p className="halving-sublabel">
                Block reward drops from 3.125 BTC to 1.5625 BTC
            </p>
        </div>
    );
}