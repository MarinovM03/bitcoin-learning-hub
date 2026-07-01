import { Calendar } from 'lucide-react';
import { getTodaysEvent } from '../../utils/bitcoinEvents';

export default function OnThisDay() {
    const event = getTodaysEvent();
    const yearsAgo = new Date().getFullYear() - event.year;

    const [month, day] = event.date.split('-');
    const dateLabel = new Date(2000, Number(month) - 1, Number(day))
        .toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

    const eyebrowText = event.mode === 'today' ? 'On this day' : 'In Bitcoin history';
    const yearsAgoLabel = yearsAgo === 1 ? '1 year ago' : `${yearsAgo} years ago`;

    return (
        <section className="otd-widget" aria-label="On this day in Bitcoin">
            <div className="otd-glow" />
            <div className="otd-top">
                <span className="otd-eyebrow">
                    <Calendar size={13} strokeWidth={2.5} />
                    {eyebrowText} · {dateLabel}
                </span>
                <span className={`otd-category otd-category--${event.category.toLowerCase()}`}>
                    {event.category}
                </span>
            </div>

            <div className="otd-body">
                <div className="otd-year-block">
                    <span className="otd-year">{event.year}</span>
                    <span className="otd-years-ago">{yearsAgoLabel}</span>
                </div>
                <div className="otd-text">
                    <h3 className="otd-title">{event.title}</h3>
                    <p className="otd-desc">{event.body}</p>
                </div>
            </div>
        </section>
    );
}
