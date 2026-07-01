import { Link } from "react-router";
import type { GlossaryTerm } from "../../types";

interface GlossaryListProps {
    terms: GlossaryTerm[];
    highlightedId?: string | null;
}

export default function GlossaryList({ terms, highlightedId }: GlossaryListProps) {
    const grouped = terms.reduce<Record<string, GlossaryTerm[]>>((acc, term) => {
        const letter = term.term[0].toUpperCase();
        if (!acc[letter]) acc[letter] = [];
        acc[letter].push(term);
        return acc;
    }, {});

    const sortedLetters = Object.keys(grouped).sort();

    return (
        <div className="glossary-list">
            {sortedLetters.map(letter => (
                <div key={letter} className="glossary-letter-group">
                    <div
                        className="glossary-letter-heading"
                        id={`glossary-letter-${letter}`}
                        data-letter={letter}
                    >
                        {letter}
                    </div>
                    {grouped[letter].map(term => (
                        <Link
                            key={term._id}
                            id={`glossary-term-${term._id}`}
                            to={`/glossary/${term._id}`}
                            className={`glossary-term-card ${highlightedId === term._id ? 'glossary-term-card--highlighted' : ''}`}
                        >
                            <div className="glossary-term-header">
                                <div className="glossary-term-left">
                                    <span className="glossary-term-name">{term.term}</span>
                                    <span className="glossary-term-category">{term.category}</span>
                                </div>
                            </div>
                            <p className="glossary-term-definition">{term.definition}</p>
                        </Link>
                    ))}
                </div>
            ))}
        </div>
    );
}
