import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Bookmark } from "lucide-react";
import * as bookmarkService from "../../services/bookmarkService";
import MyArticleCardSkeleton from "../my-article-card-skeleton/MyArticleCardSkeleton";

export default function Bookmarks() {
    const [articles, setArticles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        bookmarkService.getMyBookmarks()
            .then(result => setArticles(result))
            .catch(err => console.log("Failed to load bookmarks:", err.message))
            .finally(() => setIsLoading(false));
    }, []);

    const handleRemove = async (articleId) => {
        try {
            await bookmarkService.toggle(articleId);
            setArticles(prev => prev.filter(a => a._id !== articleId));
        } catch (err) {
            console.log("Failed to remove bookmark:", err.message);
        }
    };

    return (
        <section className="page-content">
            <div className="bookmarks-page">
                <div className="bookmarks-header">
                    <div>
                        <h1>Saved Articles</h1>
                        <p className="bookmarks-subtitle">
                            Your personal reading list.
                        </p>
                    </div>
                    <span className="my-articles-count">
                        {articles.length} {articles.length === 1 ? 'article' : 'articles'}
                    </span>
                </div>

                {isLoading ? (
                    <div className="my-articles-list">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <MyArticleCardSkeleton key={i} />
                        ))}
                    </div>
                ) : articles.length === 0 ? (
                    <div className="bookmarks-empty">
                        <div className="bookmarks-empty-icon">
                            <Bookmark size={40} strokeWidth={1.6} />
                        </div>
                        <h3>No saved articles yet</h3>
                        <p>Bookmark articles while reading to find them here later.</p>
                        <Link to="/articles" className="btn-submit bookmarks-cta">
                            Browse Articles
                        </Link>
                    </div>
                ) : (
                    <div className="my-articles-list">
                        {articles.map(article => (
                            <div key={article._id} className="my-article-card">
                                <img
                                    src={article.imageUrl}
                                    alt={article.title}
                                    className="my-article-card-img"
                                />
                                <div className="my-article-card-body">
                                    <span className="my-article-category">{article.category}</span>
                                    <h3 className="my-article-title">{article.title}</h3>
                                    <p className="my-article-summary">{article.summary}</p>
                                </div>
                                <div className="my-article-card-actions">
                                    <Link
                                        to={`/articles/${article._id}/details`}
                                        className="my-article-btn my-article-btn--view"
                                    >
                                        View
                                    </Link>
                                    <button
                                        className="my-article-btn my-article-btn--delete"
                                        onClick={() => handleRemove(article._id)}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}