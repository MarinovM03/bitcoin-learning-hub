import { useEffect, useMemo, useState } from "react";
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

    const jumpLinks = useMemo(() => [
        { id: 'article-body',     label: 'Article',  Icon: BookOpen },
        ...(hasQuiz
            ? [{ id: 'article-quiz', label: 'Quiz', Icon: HelpCircle }]
            : []),
        { id: 'article-comments', label: 'Comments', Icon: MessageSquare },
    ], [hasQuiz]);

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
    }, [jumpLinks]);

    return (
        <aside className="reading-rail" aria-label="Reading progress and navigation">
            <div className="reading-rail-ring" style={{ '--progress': progress }}>
                <svg viewBox="0 0 80 80" className="reading-rail-ring-svg" aria-hidden="true">
                    <circle className="reading-rail-ring-track" cx="40" cy="40" r="34" />
                    <circle className="reading-rail-ring-fill"  cx="40" cy="40" r="34" />
                </svg>
                <span className="reading-rail-ring-label">{Math.round(progress)}%</span>
            </div>

            <span className="reading-rail-mins">
                {minutesLeft}m left
            </span>

            <div className="reading-rail-divider" />

            <nav className="reading-rail-nav" aria-label="Article sections">
                {jumpLinks.map(({ id, label, Icon }) => (
                    <button
                        key={id}
                        type="button"
                        title={label}
                        aria-label={label}
                        className={`reading-rail-btn ${activeSection === id ? 'reading-rail-btn--active' : ''}`}
                        onClick={() => scrollToId(id)}
                    >
                        <Icon size={18} strokeWidth={2.25} />
                    </button>
                ))}
            </nav>

            <div className="reading-rail-divider" />

            <button
                type="button"
                title="Back to top"
                aria-label="Back to top"
                className="reading-rail-btn reading-rail-btn--top"
                onClick={scrollToTop}
            >
                <ArrowUp size={16} strokeWidth={2.25} />
            </button>
        </aside>
    );
}
