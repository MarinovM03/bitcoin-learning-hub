import { useEffect, useState } from "react";
import { ArrowUp, BookOpen, HelpCircle, MessageSquare } from "lucide-react";

const scrollToId = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 120;
    window.scrollTo({ top, behavior: 'smooth' });
};

const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

export default function ReadingPanel({ readProgress, readingTime, hasQuiz }) {
    const [activeSection, setActiveSection] = useState('article-body');

    const progress = Math.min(100, Math.max(0, readProgress));
    const minutesLeft = Math.max(0, Math.ceil((readingTime || 1) * (1 - progress / 100)));

    const jumpLinks = [
        { id: 'article-body',     label: 'Article',  Icon: BookOpen },
        ...(hasQuiz
            ? [{ id: 'article-quiz', label: 'Quiz', Icon: HelpCircle }]
            : []),
        { id: 'article-comments', label: 'Comments', Icon: MessageSquare },
    ];

    useEffect(() => {
        const ids = jumpLinks.map(l => l.id);
        const elements = ids
            .map(id => document.getElementById(id))
            .filter(Boolean);

        if (elements.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter(e => e.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

                if (visible.length > 0) {
                    setActiveSection(visible[0].target.id);
                }
            },
            {
                rootMargin: '-25% 0px -55% 0px',
                threshold: [0, 0.25, 0.5, 0.75, 1],
            }
        );

        elements.forEach(el => observer.observe(el));
        return () => observer.disconnect();
    }, [hasQuiz]);

    return (
        <div className="reading-panel">
            <span className="details-action-panel-title">Reading</span>

            <div className="reading-ring-wrap">
                <div className="reading-ring" style={{ '--progress': progress }}>
                    <svg viewBox="0 0 80 80" className="reading-ring-svg" aria-hidden="true">
                        <circle className="reading-ring-track" cx="40" cy="40" r="34" />
                        <circle className="reading-ring-fill"  cx="40" cy="40" r="34" />
                    </svg>
                    <span className="reading-ring-label">{Math.round(progress)}%</span>
                </div>
                <div className="reading-ring-meta">
                    <span className="reading-ring-meta-value">{minutesLeft}</span>
                    <span className="reading-ring-meta-label">
                        min{minutesLeft === 1 ? '' : 's'} left
                    </span>
                </div>
            </div>

            <div className="reading-panel-divider" />

            <span className="reading-panel-subtitle">On this page</span>

            <nav className="reading-jump-list" aria-label="Article sections">
                <button
                    type="button"
                    className="reading-jump-link reading-jump-link--top"
                    onClick={scrollToTop}
                >
                    <ArrowUp size={14} strokeWidth={2.25} />
                    <span>Back to top</span>
                </button>

                {jumpLinks.map(({ id, label, Icon }) => (
                    <button
                        key={id}
                        type="button"
                        className={`reading-jump-link ${activeSection === id ? 'reading-jump-link--active' : ''}`}
                        onClick={() => scrollToId(id)}
                    >
                        <Icon size={14} strokeWidth={2.25} />
                        <span>{label}</span>
                    </button>
                ))}
            </nav>
        </div>
    );
}
