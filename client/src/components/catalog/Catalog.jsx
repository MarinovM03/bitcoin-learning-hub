import { useEffect, useState } from "react";
import * as articleService from '../../services/articleService';
import Spinner from "../spinner/Spinner";
import { Link } from "react-router";

export default function Catalog() {
    const [articles, setArticles] = useState([]);
    const [search, setSearch] = useState("");
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

    const filteredArticles = articles.filter(article =>
        article.title.toLowerCase().includes(search.toLowerCase())
    );

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
                                />
                                <span className="catalog-card-category">{article.category}</span>
                            </div>
                            <div className="catalog-card-body">
                                <h3 className="catalog-card-title">{article.title}</h3>
                                <p className="catalog-card-summary">{article.summary}</p>
                                <div className="catalog-card-footer">
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