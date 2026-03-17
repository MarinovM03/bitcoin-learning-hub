import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router";
import * as articleService from '../../services/articleService';
import Spinner from "../spinner/Spinner";
import { ARTICLE_CATEGORIES } from '../../utils/categories';
import { getReadingTime } from '../../utils/readingTime';
import { formatViews } from '../../utils/formatters';

const ITEMS_PER_PAGE = 12;

const handleImgError = (e) => {
    e.target.onerror = null;
    e.target.classList.add('img-fallback');
    e.target.removeAttribute('src');
};

export default function Catalog() {
    const [searchParams, setSearchParams] = useSearchParams();

    const search = searchParams.get('search') || '';
    const activeCategory = searchParams.get('category') || 'All';
    const sort = searchParams.get('sort') || 'latest';
    const page = parseInt(searchParams.get('page') || '1');

    const [articles, setArticles] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        setIsLoading(true);
        articleService.getAll({ page, limit: ITEMS_PER_PAGE, sort })
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
    }, [page, sort]);

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

    const filteredArticles = articles.filter(article => {
        const matchesSearch = article.title.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = activeCategory === 'All' || article.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

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

            {error && <p className="catalog-error">{error}</p>}

            {isLoading ? (
                <Spinner />
            ) : (
                <>
                    <div className="catalog-grid">
                        {filteredArticles.length === 0 && !error && (
                            <p className="catalog-empty">No articles found matching your search.</p>
                        )}
                        {filteredArticles.map(article => (
                            <Link
                                key={article._id}
                                to={`/articles/${article._id}/details`}
                                className="catalog-card"
                            >
                                <div className="catalog-card-img-wrap">
                                    <img
                                        src={article.imageUrl}
                                        alt={article.title}
                                        className="catalog-card-img"
                                        onError={handleImgError}
                                    />
                                    <span className="catalog-card-category">{article.category}</span>
                                </div>
                                <div className="catalog-card-body">
                                    <h3 className="catalog-card-title">{article.title}</h3>
                                    <p className="catalog-card-summary">{article.summary}</p>
                                    <div className="catalog-card-footer">
                                        <span className="catalog-card-meta">{getReadingTime(article.content)} min read</span>
                                        <span className="catalog-card-meta">{formatViews(article.views ?? 0)} views</span>
                                        <span className="catalog-card-read">Read Article →</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="catalog-pagination">
                            <button
                                className="catalog-page-btn"
                                onClick={() => setParam('page', String(page - 1))}
                                disabled={page === 1}
                            >
                                ← Prev
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                <button
                                    key={p}
                                    className={`catalog-page-btn ${p === page ? 'catalog-page-btn--active' : ''}`}
                                    onClick={() => setParam('page', String(p))}
                                >
                                    {p}
                                </button>
                            ))}

                            <button
                                className="catalog-page-btn"
                                onClick={() => setParam('page', String(page + 1))}
                                disabled={page === totalPages}
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