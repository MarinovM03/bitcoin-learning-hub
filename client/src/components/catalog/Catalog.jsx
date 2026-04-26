import { useMemo } from "react";
import { useSearchParams } from "react-router";
import { Search, X, SearchX, ChevronLeft, ChevronRight } from "lucide-react";
import ArticleCard from "../article-card/ArticleCard";
import ArticleCardSkeleton from "../article-card-skeleton/ArticleCardSkeleton";
import { ARTICLE_CATEGORIES } from '../../utils/categories';
import { ARTICLE_DIFFICULTIES } from '../../utils/difficulties';
import PageMeta from "../page-meta/PageMeta";
import { useArticles } from '../../hooks/queries/useArticles';

const SORT_LABELS = {
    latest: 'Latest',
    views: 'Most Viewed',
};

const ITEMS_PER_PAGE = 12;

const getPaginationPages = (current, total) => {
    if (total <= 7) {
        return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages = [];
    pages.push(1);
    if (current > 3) pages.push('...');
    for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) {
        pages.push(p);
    }
    if (current < total - 2) pages.push('...');
    pages.push(total);

    return pages;
};

export default function Catalog() {
    const [searchParams, setSearchParams] = useSearchParams();

    const search = searchParams.get('search') || '';
    const activeCategory = searchParams.get('category') || 'All';
    const activeDifficulty = searchParams.get('difficulty') || 'All';
    const sort = searchParams.get('sort') || 'latest';
    const page = parseInt(searchParams.get('page') || '1');

    const { data, isPending, isError } = useArticles({
        page,
        limit: ITEMS_PER_PAGE,
        sort,
        search,
        category: activeCategory,
        difficulty: activeDifficulty,
    });

    const articles = data?.articles || [];
    const totalPages = data?.totalPages || 1;
    const total = data?.total || 0;
    const error = isError ? "Failed to load articles. Please try again later." : '';
    const isLoading = isPending;

    const setParam = (key, value) => {
        const next = new URLSearchParams(searchParams);
        if (value === '' || value === 'All' || value === 'latest') {
            next.delete(key);
        } else {
            next.set(key, value);
        }
        if (key !== 'page') next.delete('page');
        setSearchParams(next);
    };

    const clearFilters = () => {
        setSearchParams(new URLSearchParams());
    };

    const activeFilters = useMemo(() => {
        const chips = [];
        if (search) chips.push({ key: 'search', label: 'Search', value: search, resetTo: '' });
        if (activeCategory !== 'All') chips.push({ key: 'category', label: 'Category', value: activeCategory, resetTo: 'All' });
        if (activeDifficulty !== 'All') chips.push({ key: 'difficulty', label: 'Level', value: activeDifficulty, resetTo: 'All' });
        if (sort !== 'latest') chips.push({ key: 'sort', label: 'Sort', value: SORT_LABELS[sort] || sort, resetTo: 'latest' });
        return chips;
    }, [search, activeCategory, activeDifficulty, sort]);

    return (
        <section id="catalog-page" className="page-content catalog-page">
            <PageMeta title="All Articles" description="Browse the full collection of Bitcoin and cryptocurrency articles. Filter by category, difficulty, and topic." />
            <h1>All Articles</h1>
            <p className="catalog-subtitle">Browse the full collection of Bitcoin and cryptocurrency knowledge.</p>

            <div className="catalog-toolbar">
                <div className="catalog-search-wrap">
                    <span className="catalog-search-icon">
                        <Search size={16} strokeWidth={2} />
                    </span>
                    <input
                        type="text"
                        className="catalog-search-input"
                        placeholder="Search by title..."
                        value={search}
                        onChange={(e) => setParam('search', e.target.value)}
                    />
                </div>
                <div className="catalog-toolbar-right">
                    <select
                        className="catalog-sort-select"
                        value={sort}
                        onChange={(e) => setParam('sort', e.target.value)}
                    >
                        <option value="latest">Latest</option>
                        <option value="views">Most Viewed</option>
                    </select>
                    <span className="catalog-count">
                        <span>{total}</span> {total === 1 ? 'article' : 'articles'}
                    </span>
                </div>
            </div>

            <div className="catalog-filter-tabs">
                {["All", ...ARTICLE_CATEGORIES].map(cat => (
                    <button
                        key={cat}
                        className={`catalog-tab ${activeCategory === cat ? 'catalog-tab--active' : ''}`}
                        onClick={() => setParam('category', cat)}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className="catalog-difficulty-tabs">
                {["All", ...ARTICLE_DIFFICULTIES].map(d => (
                    <button
                        key={d}
                        className={`catalog-difficulty-tab catalog-difficulty-tab--${d.toLowerCase()} ${activeDifficulty === d ? 'catalog-difficulty-tab--active' : ''}`}
                        onClick={() => setParam('difficulty', d)}
                    >
                        {d}
                    </button>
                ))}
            </div>

            {activeFilters.length > 0 && (
                <div className="catalog-active-filters" aria-label="Active filters">
                    {activeFilters.map(chip => (
                        <button
                            key={chip.key}
                            type="button"
                            className="catalog-active-filter"
                            onClick={() => setParam(chip.key, chip.resetTo)}
                            aria-label={`Clear ${chip.label} filter`}
                        >
                            <span className="catalog-active-filter-label">{chip.label}:</span>
                            <span className="catalog-active-filter-value">{chip.value}</span>
                            <X size={12} strokeWidth={2.5} />
                        </button>
                    ))}
                    <button
                        type="button"
                        className="catalog-clear-filters-btn"
                        onClick={clearFilters}
                    >
                        Clear all
                    </button>
                </div>
            )}

            {error && <p className="catalog-error">{error}</p>}

            {isLoading ? (
                <div className="catalog-grid">
                    {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                        <ArticleCardSkeleton key={i} />
                    ))}
                </div>
            ) : (
                <>
                    {articles.length === 0 && !error ? (
                        <div className="catalog-empty">
                            <SearchX size={42} strokeWidth={1.5} />
                            <h3 className="catalog-empty-title">No articles found</h3>
                            <p className="catalog-empty-text">
                                {activeFilters.length > 0
                                    ? 'Try removing a filter or clearing all filters.'
                                    : 'There are no articles yet. Check back soon.'}
                            </p>
                            {activeFilters.length > 0 && (
                                <button
                                    type="button"
                                    className="catalog-empty-btn"
                                    onClick={clearFilters}
                                >
                                    Clear filters
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="catalog-grid">
                            {articles.map(article => (
                                <ArticleCard key={article._id} article={article} />
                            ))}
                        </div>
                    )}

                    {totalPages > 1 && (
                        <div className="catalog-pagination">
                            <button
                                className="catalog-page-btn catalog-page-btn--nav"
                                onClick={() => setParam('page', String(page - 1))}
                                disabled={page === 1}
                                aria-label="Previous page"
                            >
                                <ChevronLeft size={16} strokeWidth={2.25} />
                                <span>Prev</span>
                            </button>

                            {getPaginationPages(page, totalPages).map((p, index) =>
                                p === '...' ? (
                                    <span key={`ellipsis-${index}`} className="catalog-page-ellipsis">
                                        …
                                    </span>
                                ) : (
                                    <button
                                        key={p}
                                        className={`catalog-page-btn ${p === page ? 'catalog-page-btn--active' : ''}`}
                                        onClick={() => setParam('page', String(p))}
                                        aria-label={`Page ${p}`}
                                    >
                                        {p}
                                    </button>
                                )
                            )}

                            <button
                                className="catalog-page-btn catalog-page-btn--nav"
                                onClick={() => setParam('page', String(page + 1))}
                                disabled={page === totalPages}
                                aria-label="Next page"
                            >
                                <span>Next</span>
                                <ChevronRight size={16} strokeWidth={2.25} />
                            </button>
                        </div>
                    )}
                </>
            )}
        </section>
    );
}