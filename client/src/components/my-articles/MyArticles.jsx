import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import * as articleService from "../../services/articleService";
import * as likeService from "../../services/likeService";
import ConfirmModal from "../common/ConfirmModal";
import Spinner from "../spinner/Spinner";
import { useAuth } from "../../contexts/AuthContext";

const handleImgError = (e) => {
    e.target.onerror = null;
    e.target.src = 'https://placehold.co/600x400/1a1a1a/F7931A?text=₿';
};

export default function MyArticles() {
    const navigate = useNavigate();
    const { userId } = useAuth();

    const [myArticles, setMyArticles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('published');
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [totalLikes, setTotalLikes] = useState(0);

    useEffect(() => {
        articleService.getMyArticles()
            .then(async (result) => {
                setMyArticles(result);
                const published = result.filter(a => a.status === 'published');
                const likeCounts = await Promise.all(
                    published.map(a =>
                        likeService.getAllForArticle(a._id).then(likes => likes.length).catch(() => 0)
                    )
                );
                setTotalLikes(likeCounts.reduce((sum, n) => sum + n, 0));
            })
            .catch(err => console.log("Failed to load articles:", err.message))
            .finally(() => setIsLoading(false));
    }, [userId]);

    const confirmDelete = async () => {
        try {
            await articleService.remove(deleteTarget.id);
            setMyArticles(prev => prev.filter(a => a._id !== deleteTarget.id));
        } catch (err) {
            console.log("Delete failed:", err.message);
        } finally {
            setDeleteTarget(null);
        }
    };

    const publishedArticles = myArticles.filter(a => a.status === 'published');
    const draftArticles = myArticles.filter(a => a.status === 'draft');
    const articles = activeTab === 'published' ? publishedArticles : draftArticles;

    return (
        <section id="my-articles-page" className="page-content">
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

            <div className="my-articles-page">
                <div className="my-articles-page-header">
                    <div>
                        <h1>My Articles</h1>
                        <p className="my-articles-page-subtitle">
                            {publishedArticles.length} published · {draftArticles.length} drafts · {totalLikes} likes received
                        </p>
                    </div>
                    <Link to="/articles/create" className="btn-submit" style={undefined}>
                        ✏️ Write New Article
                    </Link>
                </div>

                <div className="my-articles-page-tabs">
                    <button
                        className={`my-articles-page-tab ${activeTab === 'published' ? 'my-articles-page-tab--active' : ''}`}
                        onClick={() => setActiveTab('published')}
                    >
                        Published
                        <span className="my-articles-page-tab-count">{publishedArticles.length}</span>
                    </button>
                    <button
                        className={`my-articles-page-tab ${activeTab === 'draft' ? 'my-articles-page-tab--active' : ''}`}
                        onClick={() => setActiveTab('draft')}
                    >
                        Drafts
                        <span className="my-articles-page-tab-count">{draftArticles.length}</span>
                    </button>
                </div>

                {isLoading ? (
                    <Spinner />
                ) : (
                    <div className="my-articles-page-grid">
                        {articles.length === 0 ? (
                            <div className="my-articles-page-empty">
                                {activeTab === 'published' ? (
                                    <>
                                        <p>You haven't published any articles yet.</p>
                                        <Link to="/articles/create" className="btn-submit my-articles-cta">
                                            Write Your First Article
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <p>You have no saved drafts.</p>
                                        <Link to="/articles/create" className="btn-submit my-articles-cta">
                                            Start Writing
                                        </Link>
                                    </>
                                )}
                            </div>
                        ) : (
                            articles.map(article => (
                                <div key={article._id} className="my-articles-page-card">
                                    <div className="my-articles-page-card-img-wrap">
                                        <img
                                            src={article.imageUrl}
                                            alt={article.title}
                                            className="my-articles-page-card-img"
                                            onError={handleImgError}
                                        />
                                        <span className="my-articles-page-card-category">{article.category}</span>
                                        {activeTab === 'draft' && (
                                            <span className="my-articles-page-card-draft-badge">Draft</span>
                                        )}
                                    </div>
                                    <div className="my-articles-page-card-body">
                                        <h3 className="my-articles-page-card-title">{article.title}</h3>
                                        <p className="my-articles-page-card-summary">{article.summary}</p>
                                        <div className="my-articles-page-card-footer">
                                            {activeTab === 'published' && (
                                                <Link
                                                    to={`/articles/${article._id}/details`}
                                                    className="my-articles-page-btn my-articles-page-btn--view"
                                                >
                                                    View
                                                </Link>
                                            )}
                                            <Link
                                                to={`/articles/${article._id}/edit`}
                                                className="my-articles-page-btn my-articles-page-btn--edit"
                                            >
                                                {activeTab === 'draft' ? 'Edit & Publish' : 'Edit'}
                                            </Link>
                                            <button
                                                className="my-articles-page-btn my-articles-page-btn--delete"
                                                onClick={() => setDeleteTarget({ id: article._id, title: article.title })}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}