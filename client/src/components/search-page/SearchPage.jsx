import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { Search, BookOpen, BookMarked, SearchX, X } from "lucide-react";
import * as searchService from "../../services/searchService";
import SearchResultSkeleton from "../search-result-skeleton/SearchResultSkeleton";
import PageMeta from "../page-meta/PageMeta";
import HighlightText from "../common/HighlightText";
import { ARTICLE_CATEGORIES } from "../../utils/categories";
import { ARTICLE_DIFFICULTIES } from "../../utils/difficulties";

const FULL_LIMIT = 25;

const READ_TIME_OPTIONS = [
    { value: 'short', label: 'Quick · ≤ 5 min' },
    { value: 'medium', label: 'Standard · 6–15 min' },
    { value: 'long', label: 'In-depth · 15+ min' },
];

const READ_TIME_LABELS = {
    short: '≤ 5 min',
    medium: '6–15 min',
    long: '15+ min',
};

export default function SearchPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const activeCategory = searchParams.get('category') || 'All';
    const activeDifficulty = searchParams.get('difficulty') || 'All';
    const activeReadTime = searchParams.get('readTime') || 'All';

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

        const filters = {};
        if (activeCategory !== 'All') filters.category = activeCategory;
        if (activeDifficulty !== 'All') filters.difficulty = activeDifficulty;
        if (activeReadTime !== 'All') filters.readTime = activeReadTime;

        const controller = new AbortController();
        setIsLoading(true);
        setError("");
        searchService.search(trimmed, FULL_LIMIT, filters)
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
    }, [query, activeCategory, activeDifficulty, activeReadTime]);

    const setParam = (key, value) => {
        const next = new URLSearchParams(searchParams);
        if (!value || value === 'All') {
            next.delete(key);
        } else {
            next.set(key, value);
        }
        setSearchParams(next);
    };

    const clearFilters = () => {
        const next = new URLSearchParams();
        if (query) next.set('q', query);
        setSearchParams(next);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const trimmed = draft.trim();
        if (trimmed.length < 2) return;
        const next = new URLSearchParams(searchParams);
        next.set('q', trimmed);
        setSearchParams(next);
    };

    const activeFilters = useMemo(() => {
        const chips = [];
        if (activeCategory !== 'All') chips.push({ key: 'category', label: 'Category', value: activeCategory });
        if (activeDifficulty !== 'All') chips.push({ key: 'difficulty', label: 'Level', value: activeDifficulty });
        if (activeReadTime !== 'All') chips.push({ key: 'readTime', label: 'Read time', value: READ_TIME_LABELS[activeReadTime] || activeReadTime });
        return chips;
    }, [activeCategory, activeDifficulty, activeReadTime]);

    const hasArticleFilter = activeFilters.length > 0;
    const totalResults = results.articles.length + results.glossary.length;
    const hasQuery = query.trim().length >= 2;

    return (
        <section id="search-page" className="page-content">
            <PageMeta title={query ? `Search: ${query}` : 'Search'} description="Search articles and glossary terms across Bitcoin Learning Hub." />
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

                <div className="search-page-filter-group" aria-label="Filter by category">
                    <span className="search-page-filter-label">Category</span>
                    <div className="search-page-filter-tabs">
                        {["All", ...ARTICLE_CATEGORIES].map(cat => (
                            <button
                                key={cat}
                                type="button"
                                className={`search-page-filter-tab ${activeCategory === cat ? 'search-page-filter-tab--active' : ''}`}
                                onClick={() => setParam('category', cat)}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="search-page-filter-group" aria-label="Filter by difficulty">
                    <span className="search-page-filter-label">Level</span>
                    <div className="search-page-filter-tabs">
                        {["All", ...ARTICLE_DIFFICULTIES].map(d => (
                            <button
                                key={d}
                                type="button"
                                className={`search-page-filter-tab search-page-filter-tab--${d.toLowerCase()} ${activeDifficulty === d ? 'search-page-filter-tab--active' : ''}`}
                                onClick={() => setParam('difficulty', d)}
                            >
                                {d}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="search-page-filter-group" aria-label="Filter by reading time">
                    <span className="search-page-filter-label">Read time</span>
                    <div className="search-page-filter-tabs">
                        <button
                            type="button"
                            className={`search-page-filter-tab ${activeReadTime === 'All' ? 'search-page-filter-tab--active' : ''}`}
                            onClick={() => setParam('readTime', 'All')}
                        >
                            All
                        </button>
                        {READ_TIME_OPTIONS.map(opt => (
                            <button
                                key={opt.value}
                                type="button"
                                className={`search-page-filter-tab ${activeReadTime === opt.value ? 'search-page-filter-tab--active' : ''}`}
                                onClick={() => setParam('readTime', opt.value)}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {hasArticleFilter && (
                    <div className="search-page-active-filters" aria-label="Active filters">
                        {activeFilters.map(chip => (
                            <button
                                key={chip.key}
                                type="button"
                                className="search-page-active-filter"
                                onClick={() => setParam(chip.key, 'All')}
                                aria-label={`Clear ${chip.label} filter`}
                            >
                                <span className="search-page-active-filter-label">{chip.label}:</span>
                                <span className="search-page-active-filter-value">{chip.value}</span>
                                <X size={12} strokeWidth={2.5} />
                            </button>
                        ))}
                        <button
                            type="button"
                            className="search-page-clear-filters-btn"
                            onClick={clearFilters}
                        >
                            Clear all
                        </button>
                    </div>
                )}

                {hasQuery && hasArticleFilter && (
                    <p className="search-page-filter-note">
                        Glossary results are hidden while filters are active.
                    </p>
                )}

                {hasQuery && !isLoading && !error && (
                    <p className="search-page-summary">
                        {totalResults > 0
                            ? <>Found <strong>{totalResults}</strong> {totalResults === 1 ? 'result' : 'results'} for <strong>"{query.trim()}"</strong></>
                            : <>No results for <strong>"{query.trim()}"</strong></>}
                    </p>
                )}

                {error && <p className="search-page-error">{error}</p>}

                {isLoading ? (
                    <div className="search-page-results">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <SearchResultSkeleton key={i} />
                        ))}
                    </div>
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
                                    {hasArticleFilter
                                        ? <>Try removing a filter or <button type="button" className="search-page-empty-link" onClick={clearFilters}>clearing all filters</button>.</>
                                        : <>Try a different term, check your spelling, or browse the <Link to="/articles">article catalog</Link> or <Link to="/glossary">glossary</Link> directly.</>}
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
                                                <HighlightText
                                                    text={article.title}
                                                    query={query}
                                                    className="search-page-result-title"
                                                />
                                                <HighlightText
                                                    text={article.contentSnippet || article.summary}
                                                    query={query}
                                                    className="search-page-result-summary"
                                                />
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
                                            to={`/glossary/${term._id}`}
                                            className="search-page-result"
                                        >
                                            <div className="search-page-result-body">
                                                <HighlightText
                                                    text={term.term}
                                                    query={query}
                                                    className="search-page-result-title"
                                                />
                                                <HighlightText
                                                    text={term.definition}
                                                    query={query}
                                                    className="search-page-result-summary"
                                                />
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
