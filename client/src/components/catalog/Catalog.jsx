import { useEffect, useState } from "react";
import * as articleService from '../../services/articleService';
import Spinner from "../spinner/Spinner";
import { Link } from "react-router";
import { ARTICLE_CATEGORIES } from '../../utils/categories';
import { getReadingTime } from '../../utils/readingTime';
import { formatViews } from '../../utils/formatters';

const handleImgError = (e) => {
    e.target.onerror = null;
    e.target.classList.add('img-fallback');
    e.target.removeAttribute('src');
};

export default function Catalog() {
    const [articles, setArticles] = useState([]);
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        articleService.getAll()
            .then(result => setArticles(result))
            .catch(err => {
                setError("Failed to load articles. Please try again later.");
                console.error(err.message);
            })
            .finally(() => setIsLoading(false));
    }, []);

    const filteredArticles = articles.filter(article => {
        const matchesSearch = article.title.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = activeCategory === "All" || article.category === activeCategory;
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
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <span className="catalog-count">
                    <span>{filteredArticles.length}</span> {filteredArticles.length === 1 ? 'article' : 'articles'} found
                </span>
            </div>

            <div className="catalog-filter-tabs">
                {["All", ...ARTICLE_CATEGORIES].map(cat => (
                    <button
                        key={cat}
                        className={`catalog-tab ${activeCategory === cat ? 'catalog-tab--active' : ''}`}
                        onClick={() => setActiveCategory(cat)}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {error && <p className="catalog-error">{error}</p>}

            {isLoading ? (
                <Spinner />
            ) : (
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
            )}
        </section>
    );
}