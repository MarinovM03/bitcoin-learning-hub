import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import * as articleService from '../../services/articleService';
import * as likeService from '../../services/likeService';
import * as bookmarkService from '../../services/bookmarkService';
import { useAuth } from "../../contexts/AuthContext";
import Spinner from "../spinner/Spinner";
import CommentsSection from "../comments/CommentsSection";
import ConfirmModal from "../common/ConfirmModal";
import { getReadingTime } from '../../utils/readingTime';
import { formatViews } from '../../utils/formatters';

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

const defaultAvatar = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

const handleImgError = (e) => {
    e.target.onerror = null;
    e.target.classList.add('img-fallback');
    e.target.removeAttribute('src');
};

export default function Details() {
    const navigate = useNavigate();
    const { articleId } = useParams();
    const { userId, isAuthenticated } = useAuth();

    const [article, setArticle] = useState({});
    const [totalLikes, setTotalLikes] = useState(0);
    const [hasLiked, setHasLiked] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        const fetches = [
            articleService.getOne(articleId),
            likeService.getAllForArticle(articleId),
        ];

        if (isAuthenticated) {
            fetches.push(bookmarkService.getMyBookmarks());
        }

        Promise.all(fetches)
            .then(([articleData, likesArray, bookmarks]) => {
                setArticle(articleData);
                setTotalLikes(likesArray.length);
                if (userId) {
                    setHasLiked(likesArray.some(like => like._ownerId === userId));
                }
                if (bookmarks) {
                    setIsBookmarked(bookmarks.some(a => a._id === articleId));
                }
            })
            .catch(() => navigate('/not-found'))
            .finally(() => setIsLoading(false));
    }, [articleId, userId, isAuthenticated, navigate]);

    const ownerId = article._ownerId?._id;
    const ownerUsername = article._ownerId?.username;
    const ownerProfilePicture = article._ownerId?.profilePicture;
    const isOwner = userId && ownerId && userId === String(ownerId);

    const confirmDelete = async () => {
        try {
            await articleService.remove(articleId);
            navigate('/articles');
        } catch (err) {
            console.log("Delete failed:", err.message);
            setShowDeleteModal(false);
        }
    };

    const onLike = async () => {
        if (hasLiked) return;
        try {
            await likeService.like(articleId);
            setTotalLikes(state => state + 1);
            setHasLiked(true);
        } catch (err) {
            console.log("Like failed", err);
        }
    };

    const onBookmark = async () => {
        try {
            const result = await bookmarkService.toggle(articleId);
            setIsBookmarked(result.bookmarked);
        } catch (err) {
            console.log("Bookmark failed", err);
        }
    };

    if (isLoading) return <Spinner />;

    return (
        <section id="details-page" className="page-content">
            {showDeleteModal && (
                <ConfirmModal
                    icon="📄"
                    title="Delete Article?"
                    message={`You are about to delete "${article.title}".`}
                    subMessage="This will permanently remove the article and cannot be undone."
                    confirmLabel="Delete Article"
                    onConfirm={confirmDelete}
                    onCancel={() => setShowDeleteModal(false)}
                />
            )}

            <div className="details-page">
                <div className="details-hero">
                    <img
                        className="details-img"
                        src={article.imageUrl}
                        alt={article.title}
                        onError={handleImgError}
                    />
                    <div className="details-hero-overlay" />
                    <div className="details-hero-meta">
                        <h1 className="details-hero-title">{article.title}</h1>
                        {isAuthenticated && (
                            <button
                                className={`bookmark-btn ${isBookmarked ? 'bookmark-btn--active' : ''}`}
                                onClick={onBookmark}
                                title={isBookmarked ? 'Remove bookmark' : 'Save article'}
                            >
                                {isBookmarked ? '🔖' : '🏷️'}
                            </button>
                        )}
                    </div>
                </div>

                <div className="details-body">
                    <div className="details-main">
                        <div className="details-meta-row">
                            <span className="category-tag">{article.category}</span>
                            <span className="details-reading-time">
                                {getReadingTime(article.content)} min read
                            </span>
                        </div>

                        <p className="details-summary">{article.summary}</p>

                        <div className="details-content">
                            {article.content?.split('\n').filter(Boolean).map((paragraph, i) => (
                                <p key={i}>{paragraph}</p>
                            ))}
                        </div>

                        {isAuthenticated && !isOwner && (
                            <div className="details-like-row">
                                {hasLiked ? (
                                    <div className="liked-badge">❤️ Liked</div>
                                ) : (
                                    <button className="btn-like" onClick={onLike}>
                                        🤍 Like this article
                                    </button>
                                )}
                            </div>
                        )}

                        <CommentsSection
                            articleId={articleId}
                            articleOwnerId={String(ownerId)}
                        />
                    </div>

                    <div className="details-sidebar">
                        {isOwner && (
                            <div className="details-action-panel">
                                <span className="details-action-panel-title">Actions</span>
                                <Link to={`/articles/${articleId}/edit`} className="btn-edit">
                                    ✏️ Edit Article
                                </Link>
                                <button
                                    className="btn-delete"
                                    onClick={() => setShowDeleteModal(true)}
                                >
                                    🗑️ Delete Article
                                </button>
                            </div>
                        )}

                        <div className="details-author-panel">
                            <span className="details-action-panel-title">Written by</span>
                            <div className="details-author">
                                <img
                                    src={ownerProfilePicture || defaultAvatar}
                                    alt={ownerUsername}
                                    className="details-author-avatar"
                                    onError={handleImgError}
                                />
                                <div className="details-author-info">
                                    <span className="details-author-name">
                                        {ownerUsername}
                                    </span>
                                    <span className="details-author-role">Author</span>
                                </div>
                            </div>
                        </div>

                        <div className="details-info-panel">
                            <div className="details-info-row">
                                <span className="details-info-label">Category</span>
                                <span className="details-info-value">{article.category}</span>
                            </div>
                            <div className="details-info-row">
                                <span className="details-info-label">Views</span>
                                <span className="details-info-value">{formatViews(article.views ?? 0)}</span>
                            </div>
                            <div className="details-info-row">
                                <span className="details-info-label">Likes</span>
                                <span className="details-info-value">{totalLikes}</span>
                            </div>
                            <div className="details-info-row">
                                <span className="details-info-label">Published</span>
                                <span className="details-info-value">
                                    {article.createdAt ? formatDate(article.createdAt) : '—'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}