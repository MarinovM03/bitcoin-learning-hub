import { Link } from "react-router";
import { BookMarked, ArrowRight } from "lucide-react";
import { useGlossaryTerms } from "../../hooks/queries/useGlossary";

export default function TermOfTheDay() {
    const { data: terms } = useGlossaryTerms();

    if (!terms || terms.length === 0) return null;

    const dayIndex = Math.floor(Date.now() / 86_400_000) % terms.length;
    const term = terms[dayIndex]!;

    return (
        <section className="totd-widget" aria-label="Glossary term of the day">
            <div className="totd-glow" />
            <div className="totd-top">
                <span className="totd-eyebrow">
                    <BookMarked size={13} strokeWidth={2.5} />
                    Term of the day
                </span>
                <span className="totd-category">{term.category}</span>
            </div>

            <h3 className="totd-term">{term.term}</h3>
            <p className="totd-definition">{term.definition}</p>

            <Link to={`/glossary/${term._id}`} className="totd-link">
                Full definition
                <ArrowRight size={13} strokeWidth={2.5} />
            </Link>
        </section>
    );
}
