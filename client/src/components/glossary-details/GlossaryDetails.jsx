import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { ArrowLeft, ArrowRight, BookMarked, Lightbulb, Trash2, Clock, Hash, Link2, Check, Sparkles } from "lucide-react";
import * as glossaryService from "../../services/glossaryService";
import { useAuth } from "../../contexts/AuthContext";
import Spinner from "../spinner/Spinner";
import ConfirmModal from "../common/ConfirmModal";

const WORDS_PER_MINUTE = 200;

export default function GlossaryDetails() {
    const { termId } = useParams();
    const navigate = useNavigate();
    const { userId } = useAuth();

    const [term, setTerm] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [copied, setCopied] = useState(false);
    const copyTimeoutRef = useRef(null);

    useEffect(() => {
        let cancelled = false;
        setIsLoading(true);
        setError("");

        glossaryService.getOne(termId)
            .then((data) => {
                if (cancelled) return;
                setTerm(data);
            })
            .catch((err) => {
                if (cancelled) return;
                setError(err.message || "Failed to load term.");
            })
            .finally(() => {
                if (!cancelled) setIsLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [termId]);

    useEffect(() => {
        return () => {
            if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
        };
    }, []);

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
            copyTimeoutRef.current = setTimeout(() => setCopied(false), 1800);
        } catch {
            setCopied(false);
        }
    };

    const handleDelete = async () => {
        try {
            await glossaryService.remove(termId);
            navigate('/glossary');
        } catch (err) {
            setError(err.message || "Failed to delete term.");
            setShowDeleteModal(false);
        }
    };

    if (isLoading) {
        return (
            <section className="page-content">
                <Spinner />
            </section>
        );
    }

    if (error || !term) {
        return (
            <section className="page-content">
                <div className="glossary-details-error">
                    <h2>Term not found</h2>
                    <p>{error || "This term does not exist or has been removed."}</p>
                    <Link to="/glossary" className="glossary-details-back">
                        <ArrowLeft size={16} strokeWidth={2.25} />
                        Back to Glossary
                    </Link>
                </div>
            </section>
        );
    }

    const isOwner = userId && term._ownerId === userId;
    const hasExtended = Boolean(term.extendedDefinition && term.extendedDefinition.trim());
    const hasExamples = Array.isArray(term.examples) && term.examples.length > 0;
    const hasRelated = Array.isArray(term.related) && term.related.length > 0;
    const paragraphs = hasExtended
        ? term.extendedDefinition.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
        : [];
    const wordCount = hasExtended
        ? term.extendedDefinition.trim().split(/\s+/).length
        : 0;
    const readingMinutes = wordCount > 0 ? Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE)) : 0;
    const monogram = term.term.trim().charAt(0).toUpperCase();

    return (
        <section className="page-content">
            {showDeleteModal && (
                <ConfirmModal
                    title="Remove Glossary Term?"
                    message={`You are about to remove "${term.term}" from the glossary.`}
                    subMessage="This action cannot be undone."
                    confirmLabel="Remove Term"
                    onConfirm={handleDelete}
                    onCancel={() => setShowDeleteModal(false)}
                />
            )}

            <div className="glossary-details">
                <div className="glossary-details-chrome">
                    <Link to="/glossary" className="glossary-details-back">
                        <ArrowLeft size={16} strokeWidth={2.25} />
                        Back to Glossary
                    </Link>
                    <div className="glossary-details-chrome-actions">
                        <button
                            type="button"
                            className={`glossary-details-copy-btn${copied ? ' is-copied' : ''}`}
                            onClick={handleCopyLink}
                            aria-label={copied ? "Link copied" : "Copy link to this term"}
                        >
                            {copied
                                ? <Check size={14} strokeWidth={2.75} />
                                : <Link2 size={14} strokeWidth={2.25} />}
                            {copied ? 'Copied' : 'Copy link'}
                        </button>
                        {isOwner && (
                            <button
                                className="glossary-details-delete-btn"
                                onClick={() => setShowDeleteModal(true)}
                                aria-label="Delete term"
                            >
                                <Trash2 size={14} strokeWidth={2.25} />
                                Delete
                            </button>
                        )}
                    </div>
                </div>

                <header className="glossary-details-hero">
                    <div className="glossary-details-hero-mark" aria-hidden="true">
                        {monogram}
                    </div>
                    <div className="glossary-details-hero-text">
                        <span className="glossary-details-category">
                            <BookMarked size={12} strokeWidth={2.5} />
                            {term.category}
                        </span>
                        <h1 className="glossary-details-title">{term.term}</h1>
                        <div className="glossary-details-meta">
                            {readingMinutes > 0 && (
                                <span className="glossary-details-meta-item">
                                    <Clock size={13} strokeWidth={2.25} />
                                    {readingMinutes} min read
                                </span>
                            )}
                            {hasExamples && (
                                <span className="glossary-details-meta-item">
                                    <Hash size={13} strokeWidth={2.25} />
                                    {term.examples.length} {term.examples.length === 1 ? 'example' : 'examples'}
                                </span>
                            )}
                        </div>
                    </div>
                </header>

                <div className="glossary-details-quote-card">
                    <span className="glossary-details-quote-label">Quick definition</span>
                    <p className="glossary-details-quote">{term.definition}</p>
                </div>

                {hasExtended && (
                    <article className="glossary-details-card">
                        <div className="glossary-details-card-head">
                            <span className="glossary-details-card-label">In depth</span>
                        </div>
                        <div className="glossary-details-body">
                            {paragraphs.map((para, idx) => (
                                <p key={idx} className={idx === 0 ? 'glossary-details-body-lead' : ''}>
                                    {para}
                                </p>
                            ))}
                        </div>
                    </article>
                )}

                {hasExamples && (
                    <section className="glossary-details-examples-section">
                        <div className="glossary-details-card-head">
                            <Lightbulb size={15} strokeWidth={2.25} />
                            <span className="glossary-details-card-label">Examples</span>
                        </div>
                        <ol className="glossary-details-examples">
                            {term.examples.map((example, idx) => (
                                <li key={idx} className="glossary-details-example">
                                    <span className="glossary-details-example-num">
                                        {String(idx + 1).padStart(2, '0')}
                                    </span>
                                    <p className="glossary-details-example-text">{example}</p>
                                </li>
                            ))}
                        </ol>
                    </section>
                )}

                {!hasExtended && !hasExamples && (
                    <p className="glossary-details-stub">
                        This entry doesn't have an extended explanation yet.
                    </p>
                )}

                {hasRelated && (
                    <section className="glossary-details-related">
                        <div className="glossary-details-related-head">
                            <Sparkles size={14} strokeWidth={2.25} />
                            <span className="glossary-details-card-label">
                                More in {term.category}
                            </span>
                        </div>
                        <ul className="glossary-details-related-list">
                            {term.related.map((rel) => (
                                <li key={rel._id}>
                                    <Link
                                        to={`/glossary/${rel._id}`}
                                        className="glossary-details-related-card"
                                    >
                                        <span className="glossary-details-related-term">
                                            {rel.term}
                                        </span>
                                        <span className="glossary-details-related-definition">
                                            {rel.definition}
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {(term.prev || term.next) && (
                    <nav className="glossary-details-pager" aria-label="Glossary navigation">
                        {term.prev ? (
                            <Link
                                to={`/glossary/${term.prev._id}`}
                                className="glossary-details-pager-link is-prev"
                            >
                                <ArrowLeft size={14} strokeWidth={2.25} />
                                <span className="glossary-details-pager-label">Previous</span>
                                <span className="glossary-details-pager-term">{term.prev.term}</span>
                            </Link>
                        ) : (
                            <span className="glossary-details-pager-spacer" aria-hidden="true" />
                        )}
                        {term.next ? (
                            <Link
                                to={`/glossary/${term.next._id}`}
                                className="glossary-details-pager-link is-next"
                            >
                                <span className="glossary-details-pager-label">Next</span>
                                <span className="glossary-details-pager-term">{term.next.term}</span>
                                <ArrowRight size={14} strokeWidth={2.25} />
                            </Link>
                        ) : (
                            <span className="glossary-details-pager-spacer" aria-hidden="true" />
                        )}
                    </nav>
                )}
            </div>
        </section>
    );
}
