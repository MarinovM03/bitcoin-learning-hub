// client/src/components/details/Details.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { Bookmark, Heart, PenLine, Trash2, Link2, Check, Share2, Layers, ChevronLeft, ChevronRight, CheckCircle2, Circle } from "lucide-react";
import * as articleService from '../../services/articleService';
import * as likeService from '../../services/likeService';
import * as bookmarkService from '../../services/bookmarkService';
import { useAuth } from "../../contexts/AuthContext";
import ArticleDetailsSkeleton from "../article-details-skeleton/ArticleDetailsSkeleton";
import CommentsSection from "../comments/CommentsSection";
import ConfirmModal from "../common/ConfirmModal";
import QuizSection from "../quiz/QuizSection";
import ReadingPanel from "../reading-panel/ReadingPanel";
import { formatViews } from '../../utils/formatters';
import { handleImgError } from '../../utils/imageHelpers';
import PageMeta from "../page-meta/PageMeta";

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

const defaultAvatar = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

export default function Details() {
    const navigate = useNavigate();
    const { articleId } = useParams();
    const { userId, isAuthenticated } = useAuth();

    const [article, setArticle] = useState({});
    const [totalLikes, setTotalLikes] = useState(0);
    const [hasLiked, setHasLiked] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [hasRead, setHasRead] = useState(false);
    const [isTogglingRead, setIsTogglingRead] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [relatedArticles, setRelatedArticles] = useState([]);
    const [seriesInfo, setSeriesInfo] = useState({ seriesName: '', parts: [] });
    const [readProgress, setReadProgress] = useState(0);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const onScroll = () => {
            const el = document.getElementById('article-body');
            if (!el) {
                setReadProgress(0);
                return;
            }
            const rect = el.getBoundingClientRect();
            if (rect.height <= 0) {
                setReadProgress(0);
                return;
            }
            const vpMid = window.innerHeight / 2;
            const midPastTop = vpMid - rect.top;
            const progress = (midPastTop / rect.height) * 100;
            setReadProgress(Math.max(0, Math.min(100, progress)));
        };

        onScroll();
        window.addEventListener('scroll', onScroll);
        window.addEventListener('resize', onScroll);
        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
        };
    }, [article._id]);

    useEffect(() => {
        const fetches = [
            articleService.getOne(articleId),
            likeService.getAllForArticle(articleId),
        ];

        if (isAuthenticated) {
            fetches.push(bookmarkService.getMyBookmarks().catch(() => []));
        }

        Promise.all(fetches)
            .then(([articleData, likesArray, bookmarks]) => {
                setArticle(articleData);
                setHasRead(Boolean(articleData?.hasRead));
                setTotalLikes(likesArray.length);
                if (userId) {
                    setHasLiked(likesArray.some(like => like._ownerId === userId));
                }
                if (bookmarks) {
                    setIsBookmarked(bookmarks.some(a => a._id === articleId));
                }
                return Promise.all([
                    articleService.getRelated(articleId),
                    articleService.getSeries(articleId).catch(() => ({ seriesName: '', parts: [] })),
                ]);
            })
            .then(([related, series]) => {
                setRelatedArticles(related);
                setSeriesInfo(series || { seriesName: '', parts: [] });
            })
            .catch(() => navigate('/not-found'))
            .finally(() => setIsLoading(false));
    }, [articleId, userId, isAuthenticated, navigate]);

    const ownerId = article._ownerId?._id;
    const ownerUsername = article._ownerId?.username;
    const ownerProfilePicture = article._ownerId?.profilePicture;
    const isOwner = userId && ownerId && userId === String(ownerId);

    const seriesParts = seriesInfo.parts || [];
    const isInSeries = Boolean(seriesInfo.seriesName) && seriesParts.length > 0;
    const currentSeriesIndex = isInSeries
        ? seriesParts.findIndex(p => String(p._id) === String(articleId))
        : -1;
    const prevPart = currentSeriesIndex > 0 ? seriesParts[currentSeriesIndex - 1] : null;
    const nextPart = currentSeriesIndex >= 0 && currentSeriesIndex < seriesParts.length - 1
        ? seriesParts[currentSeriesIndex + 1]
        : null;

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

    const onToggleRead = async () => {
        if (isTogglingRead) return;
        setIsTogglingRead(true);
        try {
            if (hasRead) {
                await articleService.markUnread(articleId);
                setHasRead(false);
            } else {
                await articleService.markRead(articleId);
                setHasRead(true);
            }
        } catch (err) {
            console.log("Toggle read failed", err);
        } finally {
            setIsTogglingRead(false);
        }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href)
            .then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2500);
            })
            .catch(() => {
                const input = document.createElement('input');
                input.value = window.location.href;
                document.body.appendChild(input);
                input.select();
                document.execCommand('copy');
                document.body.removeChild(input);
                setCopied(true);
                setTimeout(() => setCopied(false), 2500);
            });
    };

    if (isLoading) return <ArticleDetailsSkeleton />;

    return (
        <section id="details-page" className="page-content">
            <PageMeta
                title={article.title}
                description={article.summary}
                image={article.imageUrl}
                type="article"
            />
            <div className="read-progress-bar" style={{ width: `${readProgress}%` }} />

            <ReadingPanel
                readProgress={readProgress}
                readingTime={article.readingTime ?? 1}
                hasQuiz={Array.isArray(article.quiz) && article.quiz.length > 0}
            />

            {showDeleteModal && (
                <ConfirmModal
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
                                aria-label={isBookmarked ? 'Remove bookmark' : 'Save article'}
                            >
                                <Bookmark
                                    size={20}
                                    strokeWidth={2}
                                    fill={isBookmarked ? 'currentColor' : 'none'}
                                />
                            </button>
                        )}
                    </div>
                </div>

                <div className="details-body">
                    <div className="details-main">
                        <div className="details-meta-row">
                            <span className="category-tag">{article.category}</span>
                            {article.difficulty && (
                                <span className={`difficulty-badge difficulty-badge--${article.difficulty.toLowerCase()}`}>
                                    {article.difficulty}
                                </span>
                            )}
                            <span className="details-reading-time">
                                {article.readingTime ?? 1} min read
                            </span>
                            <span className="details-reading-time">
                                {article.content?.trim().split(/\s+/).filter(Boolean).length.toLocaleString()} words
                            </span>
                            {isInSeries && (
                                <span className="series-inline-badge">
                                    <Layers size={13} strokeWidth={2.25} />
                                    Part {article.seriesPart} of {seriesParts.length} · {seriesInfo.seriesName}
                                    {ownerUsername && <span className="series-inline-badge__author"> · by @{ownerUsername}</span>}
                                </span>
                            )}
                        </div>

                        <p className="details-summary">{article.summary}</p>

                        <div className="details-content" id="article-body">
                            {article.content?.split('\n').filter(Boolean).map((paragraph, i) => (
                                <p key={i}>{paragraph}</p>
                            ))}
                        </div>

                        {isInSeries && (prevPart || nextPart) && (
                            <nav className="series-prev-next" aria-label="Series navigation">
                                {prevPart ? (
                                    <Link
                                        to={`/articles/${prevPart._id}/details`}
                                        className="series-prev-next__link series-prev-next__link--prev"
                                    >
                                        <ChevronLeft size={18} strokeWidth={2.25} />
                                        <span className="series-prev-next__label">
                                            <span className="series-prev-next__kicker">Previous · Part {prevPart.seriesPart}</span>
                                            <span className="series-prev-next__title">{prevPart.title}</span>
                                        </span>
                                    </Link>
                                ) : <span />}
                                {nextPart ? (
                                    <Link
                                        to={`/articles/${nextPart._id}/details`}
                                        className="series-prev-next__link series-prev-next__link--next"
                                    >
                                        <span className="series-prev-next__label">
                                            <span className="series-prev-next__kicker">Next · Part {nextPart.seriesPart}</span>
                                            <span className="series-prev-next__title">{nextPart.title}</span>
                                        </span>
                                        <ChevronRight size={18} strokeWidth={2.25} />
                                    </Link>
                                ) : <span />}
                            </nav>
                        )}

                        {isAuthenticated && (
                            <div className="details-read-row">
                                <button
                                    type="button"
                                    className={`btn-mark-read ${hasRead ? 'btn-mark-read--done' : ''}`}
                                    onClick={onToggleRead}
                                    disabled={isTogglingRead}
                                >
                                    {hasRead
                                        ? <CheckCircle2 size={16} strokeWidth={2.25} />
                                        : <Circle size={16} strokeWidth={2.25} />}
                                    {hasRead ? 'Marked as Read' : 'Mark as Read'}
                                </button>
                                <span className="btn-mark-read-hint">
                                    {hasRead
                                        ? 'Counts toward learning path progress.'
                                        : 'Track your progress through learning paths.'}
                                </span>
                            </div>
                        )}

                        {isAuthenticated && !isOwner && (
                            <div className="details-like-row">
                                {hasLiked ? (
                                    <div className="liked-badge">
                                        <Heart size={16} strokeWidth={2} fill="currentColor" />
                                        Liked
                                    </div>
                                ) : (
                                    <button className="btn-like" onClick={onLike}>
                                        <Heart size={16} strokeWidth={2} />
                                        Like this article
                                    </button>
                                )}
                            </div>
                        )}

                        <div id="article-quiz">
                            <QuizSection quiz={article.quiz} />
                        </div>

                        <div id="article-comments">
                            <CommentsSection
                                articleId={articleId}
                                articleOwnerId={String(ownerId)}
                            />
                        </div>
                    </div>

                    <div className="details-sidebar">
                        {isOwner && (
                            <div className="details-action-panel">
                                <span className="details-action-panel-title">Actions</span>
                                <Link to={`/articles/${articleId}/edit`} className="btn-edit">
                                    <PenLine size={16} strokeWidth={2} />
                                    Edit Article
                                </Link>
                                <button className="btn-delete" onClick={() => setShowDeleteModal(true)}>
                                    <Trash2 size={16} strokeWidth={2} />
                                    Delete Article
                                </button>
                            </div>
                        )}

                        {isInSeries && (
                            <div className="details-series-panel">
                                <span className="details-action-panel-title">
                                    <Layers size={14} strokeWidth={2.25} />
                                    {seriesInfo.seriesName}
                                </span>
                                {ownerUsername && (
                                    <Link to={`/users/${ownerId}`} className="details-series-author">
                                        by @{ownerUsername}
                                    </Link>
                                )}
                                <ol className="details-series-list">
                                    {seriesParts.map(part => {
                                        const isCurrent = String(part._id) === String(articleId);
                                        return (
                                            <li
                                                key={part._id}
                                                className={`details-series-item ${isCurrent ? 'details-series-item--current' : ''}`}
                                            >
                                                {isCurrent ? (
                                                    <span className="details-series-link">
                                                        <span className="details-series-part">Part {part.seriesPart}</span>
                                                        <span className="details-series-title">{part.title}</span>
                                                    </span>
                                                ) : (
                                                    <Link
                                                        to={`/articles/${part._id}/details`}
                                                        className="details-series-link"
                                                    >
                                                        <span className="details-series-part">Part {part.seriesPart}</span>
                                                        <span className="details-series-title">{part.title}</span>
                                                    </Link>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ol>
                            </div>
                        )}

                        <div className="details-author-panel">
                            <span className="details-action-panel-title">Written by</span>
                            <Link to={`/users/${ownerId}`} className="details-author details-author--link">
                                <img
                                    src={ownerProfilePicture || defaultAvatar}
                                    alt={ownerUsername}
                                    className="details-author-avatar"
                                    onError={handleImgError}
                                />
                                <div className="details-author-info">
                                    <span className="details-author-name">{ownerUsername}</span>
                                    <span className="details-author-role">View profile →</span>
                                </div>
                            </Link>
                        </div>

                        <div className="details-info-panel">
                            <div className="details-info-row">
                                <span className="details-info-label">Category</span>
                                <span className="details-info-value">{article.category}</span>
                            </div>
                            <div className="details-info-row">
                                <span className="details-info-label">Difficulty</span>
                                <span className={`difficulty-badge difficulty-badge--${article.difficulty?.toLowerCase()}`}>
                                    {article.difficulty || 'Beginner'}
                                </span>
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

                        <div className="details-share-panel">
                            <span className="details-action-panel-title">Share</span>
                            <div className="details-share-buttons">
                                <button
                                    className={`btn-share btn-share--copy ${copied ? 'btn-share--copied' : ''}`}
                                    onClick={handleCopyLink}
                                    title="Copy link"
                                >
                                    {copied
                                        ? <Check size={16} strokeWidth={2.25} />
                                        : <Link2 size={16} strokeWidth={2.25} />}
                                    <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                                </button>

                                <a
                                    className="btn-share btn-share--twitter"
                                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(window.location.href)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="Share on X"
                                >
                                    <svg viewBox="0 0 24 24" className="btn-share-icon" fill="currentColor">
                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                    </svg>
                                    <span>X</span>
                                </a>

                                <a
                                    className="btn-share btn-share--facebook"
                                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="Share on Facebook"
                                >
                                    <svg viewBox="0 0 24 24" className="btn-share-icon" fill="currentColor">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                    </svg>
                                    <span>Facebook</span>
                                </a>

                                <a
                                    className="btn-share btn-share--linkedin"
                                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="Share on LinkedIn"
                                >
                                    <svg viewBox="0 0 24 24" className="btn-share-icon" fill="currentColor">
                                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                    </svg>
                                    <span>LinkedIn</span>
                                </a>

                                {typeof navigator.share === 'function' && (
                                    <button
                                        className="btn-share btn-share--native"
                                        onClick={() => navigator.share({
                                            title: article.title,
                                            text: article.summary,
                                            url: window.location.href,
                                        })}
                                        title="Share"
                                    >
                                        <Share2 size={16} strokeWidth={2} />
                                        <span>Share</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {relatedArticles.length > 0 && (
                            <div className="details-related-panel">
                                <span className="details-action-panel-title">Related Articles</span>
                                <div className="details-related-list">
                                    {relatedArticles.map(rel => (
                                        <Link
                                            key={rel._id}
                                            to={`/articles/${rel._id}/details`}
                                            className="details-related-card"
                                        >
                                            <img
                                                src={rel.imageUrl}
                                                alt={rel.title}
                                                className="details-related-img"
                                                onError={handleImgError}
                                            />
                                            <div className="details-related-body">
                                                <span className="details-related-category">{rel.category}</span>
                                                <p className="details-related-title">{rel.title}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}