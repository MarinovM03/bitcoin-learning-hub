import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import * as articleService from '../../services/articleService';
import Spinner from "../spinner/Spinner";
import ArticleCard from "../article-card/ArticleCard";
import { ARTICLE_CATEGORIES } from '../../utils/categories';
import { ARTICLE_DIFFICULTIES } from '../../utils/difficulties';

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

    const [articles, setArticles] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        setIsLoading(true);
        setError('');
        articleService.getAll({ page, limit: ITEMS_PER_PAGE, sort, search, category: activeCategory, difficulty: activeDifficulty })
            .then(result => {
                setArticles(result.articles);
                setTotalPages(result.totalPages);
                setTotal(result.total);
            })
            .catch(err => {
                setError("Failed to load articles. Please try again later.");
                console.error(err.message);
            })
            .finally(() => setIsLoading(false));
    }, [page, sort, search, activeCategory, activeDifficulty]);

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

    return (
        <section id="catalog-page" className="page-content catalog-page">
            <h1>All Articles</h1>
            <p className="catalog-subtitle">Browse the full collection of Bitcoin and cryptocurrency knowledge.</p>

            <div className="catalog-toolbar">
                <div className="catalog-search-wrap">
                    <span className="catalog-search-icon">🔍</span>
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

            {error && <p className="catalog-error">{error}</p>}

            {isLoading ? (
                <Spinner />
            ) : (
                <>
                    <div className="catalog-grid">
                        {articles.length === 0 && !error && (
                            <p className="catalog-empty">No articles found matching your search.</p>
                        )}
                        {articles.map(article => (
                            <ArticleCard key={article._id} article={article} />
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="catalog-pagination">
                            <button
                                className="catalog-page-btn"
                                onClick={() => setParam('page', String(page - 1))}
                                disabled={page === 1}
                                aria-label="Previous page"
                            >
                                ← Prev
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
                                className="catalog-page-btn"
                                onClick={() => setParam('page', String(page + 1))}
                                disabled={page === totalPages}
                                aria-label="Next page"
                            >
                                Next →
                            </button>
                        </div>
                    )}
                </>
            )}
        </section>
    );
}