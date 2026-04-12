import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { Search, BookOpen, BookMarked, SearchX } from "lucide-react";
import * as searchService from "../../services/searchService";
import Spinner from "../spinner/Spinner";

const FULL_LIMIT = 25;

export default function SearchPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const [draft, setDraft] = useState(query);

    const [results, setResults] = useState({ articles: [], glossary: [] });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        setDraft(query);
    }, [query]);

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
        setError("");
        searchService.search(trimmed, FULL_LIMIT)
            .then(data => {
                if (controller.signal.aborted) return;
                setResults({ articles: data.articles || [], glossary: data.glossary || [] });
            })
            .catch(err => {
                if (controller.signal.aborted) return;
                setError(err.message || "Search failed");
            })
            .finally(() => {
                if (!controller.signal.aborted) setIsLoading(false);
            });

        return () => controller.abort();
    }, [query]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const trimmed = draft.trim();
        if (trimmed.length < 2) return;
        setSearchParams({ q: trimmed });
    };

    const totalResults = results.articles.length + results.glossary.length;
    const hasQuery = query.trim().length >= 2;

    return (
        <section id="search-page" className="page-content">
            <div className="search-page">
                <div className="search-page-header">
                    <h1>Search</h1>
                    <p className="search-page-subtitle">
                        Find articles and glossary terms across Bitcoin Hub.
                    </p>
                </div>

                <form className="search-page-form" onSubmit={handleSubmit}>
                    <Search size={18} strokeWidth={2} className="search-page-form-icon" />
                    <input
                        type="text"
                        className="search-page-form-input"
                        placeholder="Search articles and glossary..."
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        autoFocus
                    />
                    <button type="submit" className="search-page-form-submit">Search</button>
                </form>

                {hasQuery && !isLoading && !error && (
                    <p className="search-page-summary">
                        {totalResults > 0
                            ? <>Found <strong>{totalResults}</strong> {totalResults === 1 ? 'result' : 'results'} for <strong>"{query.trim()}"</strong></>
                            : <>No results for <strong>"{query.trim()}"</strong></>}
                    </p>
                )}

                {error && <p className="search-page-error">{error}</p>}

                {isLoading ? (
                    <Spinner />
                ) : (
                    <>
                        {!hasQuery && (
                            <div className="search-page-empty">
                                <Search size={42} strokeWidth={1.5} />
                                <h3 className="search-page-empty-title">Start typing to search</h3>
                                <p className="search-page-empty-text">
                                    Search across every published article and glossary term. Try a concept like <em>halving</em>, <em>mempool</em>, or <em>lightning</em>.
                                </p>
                            </div>
                        )}

                        {hasQuery && totalResults === 0 && !error && (
                            <div className="search-page-empty">
                                <SearchX size={42} strokeWidth={1.5} />
                                <h3 className="search-page-empty-title">No matches</h3>
                                <p className="search-page-empty-text">
                                    Try a different term, check your spelling, or browse the{' '}
                                    <Link to="/articles">article catalog</Link> or{' '}
                                    <Link to="/glossary">glossary</Link> directly.
                                </p>
                            </div>
                        )}

                        {results.articles.length > 0 && (
                            <div className="search-page-section">
                                <div className="search-page-section-head">
                                    <BookOpen size={16} strokeWidth={2.25} />
                                    <h2>Articles</h2>
                                    <span className="search-page-section-count">{results.articles.length}</span>
                                </div>
                                <div className="search-page-results">
                                    {results.articles.map(article => (
                                        <Link
                                            key={article._id}
                                            to={`/articles/${article._id}/details`}
                                            className="search-page-result"
                                        >
                                            <div className="search-page-result-body">
                                                <span className="search-page-result-title">{article.title}</span>
                                                <span className="search-page-result-summary">{article.summary}</span>
                                                <div className="search-page-result-meta">
                                                    <span className="search-page-result-badge">{article.category}</span>
                                                    {article.difficulty && (
                                                        <span className="search-page-result-badge search-page-result-badge--muted">
                                                            {article.difficulty}
                                                        </span>
                                                    )}
                                                    {article.readingTime && (
                                                        <span className="search-page-result-dim">
                                                            {article.readingTime} min read
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {results.glossary.length > 0 && (
                            <div className="search-page-section">
                                <div className="search-page-section-head">
                                    <BookMarked size={16} strokeWidth={2.25} />
                                    <h2>Glossary</h2>
                                    <span className="search-page-section-count">{results.glossary.length}</span>
                                </div>
                                <div className="search-page-results">
                                    {results.glossary.map(term => (
                                        <Link
                                            key={term._id}
                                            to={`/glossary#glossary-letter-${term.term[0].toUpperCase()}`}
                                            className="search-page-result"
                                        >
                                            <div className="search-page-result-body">
                                                <span className="search-page-result-title">{term.term}</span>
                                                <span className="search-page-result-summary">{term.definition}</span>
                                                <div className="search-page-result-meta">
                                                    <span className="search-page-result-badge">{term.category}</span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </section>
    );
}
