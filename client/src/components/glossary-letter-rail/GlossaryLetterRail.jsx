import { useEffect, useState } from "react";

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function GlossaryLetterRail({ availableLetters }) {
    const [activeLetter, setActiveLetter] = useState(null);

    useEffect(() => {
        const headings = Array.from(document.querySelectorAll('.glossary-letter-heading'));
        if (headings.length === 0) {
            setActiveLetter(null);
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter(e => e.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

                if (visible.length > 0) {
                    const letter = visible[0].target.dataset.letter;
                    if (letter) setActiveLetter(letter);
                }
            },
            {
                rootMargin: '-20% 0px -70% 0px',
                threshold: [0, 0.5, 1],
            }
        );

        headings.forEach(h => observer.observe(h));
        return () => observer.disconnect();
    }, [availableLetters]);

    const handleClick = (letter) => {
        const el = document.getElementById(`glossary-letter-${letter}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <nav className="glossary-letter-rail" aria-label="Jump to letter">
            {ALPHABET.map(letter => {
                const isPresent = availableLetters.has(letter);
                const isActive = activeLetter === letter;

                if (!isPresent) {
                    return (
                        <span
                            key={letter}
                            className="glossary-letter-rail-btn glossary-letter-rail-btn--disabled"
                            aria-disabled="true"
                        >
                            {letter}
                        </span>
                    );
                }

                return (
                    <button
                        key={letter}
                        type="button"
                        className={`glossary-letter-rail-btn ${isActive ? 'glossary-letter-rail-btn--active' : ''}`}
                        onClick={() => handleClick(letter)}
                        aria-label={`Jump to letter ${letter}`}
                    >
                        {letter}
                    </button>
                );
            })}
        </nav>
    );
}
