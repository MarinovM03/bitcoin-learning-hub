import { Link } from "react-router";
import Spinner from "../spinner/Spinner";
import ConfirmModal from "../common/ConfirmModal";
import { useState } from "react";
import * as articleService from "../../services/articleService";

export default function MyArticlesList({ articles, isLoading, onArticleDeleted }) {
    const [deleteTarget, setDeleteTarget] = useState(null);

    const confirmDelete = async () => {
        try {
            await articleService.remove(deleteTarget.id);
            onArticleDeleted(deleteTarget.id);
        } catch (err) {
            console.log("Delete failed:", err.message);
        } finally {
            setDeleteTarget(null);
        }
    };

    return (
        <div className="my-articles-section">
            {deleteTarget && (
                <ConfirmModal
                    icon="📄"
                    title="Delete Article?"
                    message={`You are about to delete "${deleteTarget.title}".`}
                    subMessage="This will permanently remove the article and cannot be undone."
                    confirmLabel="Delete Article"
                    onConfirm={confirmDelete}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}

            <div className="my-articles-header">
                <h2>My Articles</h2>
                <span className="my-articles-count">
                    {articles.length} {articles.length === 1 ? 'article' : 'articles'}
                </span>
            </div>

            {isLoading ? (
                <Spinner />
            ) : articles.length === 0 ? (
                <div className="my-articles-empty">
                    <p>You haven't published any articles yet.</p>
                    <Link to="/articles/create" className="btn-submit my-articles-cta">
                        Write Your First Article
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
                                <Link
                                    to={`/articles/${article._id}/edit`}
                                    className="my-article-btn my-article-btn--edit"
                                >
                                    Edit
                                </Link>
                                <button
                                    className="my-article-btn my-article-btn--delete"
                                    onClick={() => setDeleteTarget({ id: article._id, title: article.title })}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}