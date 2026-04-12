import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Search, X, BookOpen, BookMarked, ArrowRight, Loader2 } from "lucide-react";
import * as searchService from "../../services/searchService";

const DEBOUNCE_MS = 300;
const QUICK_LIMIT = 5;

export default function SearchOverlay({ onClose }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState({ articles: [], glossary: [] });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const inputRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKey);
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            window.removeEventListener("keydown", handleKey);
            document.body.style.overflow = originalOverflow;
        };
    }, [onClose]);

    useEffect(() => {
        const trimmed = query.trim();
        if (trimmed.length < 2) {
            setResults({ articles: [], glossary: [] });
            setIsLoading(false);
            setError("");
            return;
        }

        const controller = new AbortController();
        setIsLoading(true);
        const timer = setTimeout(() => {
            searchService.search(trimmed, QUICK_LIMIT)
                .then(data => {
                    if (controller.signal.aborted) return;
                    setResults({ articles: data.articles || [], glossary: data.glossary || [] });
                    setError("");
                })
                .catch(err => {
                    if (controller.signal.aborted) return;
                    setError(err.message || "Search failed");
                })
                .finally(() => {
                    if (!controller.signal.aborted) setIsLoading(false);
                });
        }, DEBOUNCE_MS);

        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [query]);

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const trimmed = query.trim();
        if (trimmed.length < 2) return;
        onClose();
        navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    };

    const hasQuery = query.trim().length >= 2;
    const hasResults = results.articles.length > 0 || results.glossary.length > 0;

    return (
        <div className="search-overlay-backdrop" onClick={handleBackdropClick} role="dialog" aria-modal="true" aria-label="Search">
            <div className="search-overlay">
                <form className="search-overlay-form" onSubmit={handleSubmit}>
                    <Search size={18} strokeWidth={2} className="search-overlay-icon" />
                    <input
                        ref={inputRef}
                        type="text"
                        className="search-overlay-input"
                        placeholder="Search articles and glossary..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        aria-label="Search query"
                    />
                    {isLoading && <Loader2 size={16} className="search-overlay-spinner" aria-hidden="true" />}
                    <button
                        type="button"
                        className="search-overlay-close"
                        onClick={onClose}
                        aria-label="Close search"
                    >
                        <X size={16} strokeWidth={2.25} />
                    </button>
                </form>

                <div className="search-overlay-body">
                    {!hasQuery && (
                        <div className="search-overlay-hint">
                            <p>Type at least 2 characters to search.</p>
                            <p className="search-overlay-hint-sub">Searches across all articles and glossary terms.</p>
                        </div>
                    )}

                    {hasQuery && error && (
                        <div className="search-overlay-empty">
                            <p>{error}</p>
                        </div>
                    )}

                    {hasQuery && !error && !isLoading && !hasResults && (
                        <div className="search-overlay-empty">
                            <p>No results for "{query.trim()}".</p>
                            <p className="search-overlay-hint-sub">Try a different term or check the spelling.</p>
                        </div>
                    )}

                    {hasQuery && !error && hasResults && (
                        <>
                            {results.articles.length > 0 && (
                                <div className="search-overlay-section">
                                    <span className="search-overlay-section-title">
                                        <BookOpen size={12} strokeWidth={2.25} />
                                        Articles
                                    </span>
                                    <ul className="search-overlay-list">
                                        {results.articles.map(article => (
                                            <li key={article._id}>
                                                <Link
                                                    to={`/articles/${article._id}/details`}
                                                    className="search-overlay-item"
                                                    onClick={onClose}
                                                >
                                                    <div className="search-overlay-item-body">
                                                        <span className="search-overlay-item-title">{article.title}</span>
                                                        <span className="search-overlay-item-summary">{article.summary}</span>
                                                    </div>
                                                    <div className="search-overlay-item-meta">
                                                        <span className="search-overlay-item-badge">{article.category}</span>
                                                    </div>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {results.glossary.length > 0 && (
                                <div className="search-overlay-section">
                                    <span className="search-overlay-section-title">
                                        <BookMarked size={12} strokeWidth={2.25} />
                                        Glossary
                                    </span>
                                    <ul className="search-overlay-list">
                                        {results.glossary.map(term => (
                                            <li key={term._id}>
                                                <Link
                                                    to={`/glossary#glossary-letter-${term.term[0].toUpperCase()}`}
                                                    className="search-overlay-item"
                                                    onClick={onClose}
                                                >
                                                    <div className="search-overlay-item-body">
                                                        <span className="search-overlay-item-title">{term.term}</span>
                                                        <span className="search-overlay-item-summary">{term.definition}</span>
                                                    </div>
                                                    <div className="search-overlay-item-meta">
                                                        <span className="search-overlay-item-badge">{term.category}</span>
                                                    </div>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <button
                                type="button"
                                className="search-overlay-see-all"
                                onClick={handleSubmit}
                            >
                                <span>See all results</span>
                                <ArrowRight size={14} strokeWidth={2.25} />
                            </button>
                        </>
                    )}
                </div>

                <div className="search-overlay-footer">
                    <span><kbd>Esc</kbd> to close</span>
                    <span><kbd>Enter</kbd> to see all</span>
                </div>
            </div>
        </div>
    );
}
