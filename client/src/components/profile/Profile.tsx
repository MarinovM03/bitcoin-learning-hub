import { useState } from "react";
import { Link } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
    Users,
    FileText,
    Library,
    Bookmark,
    ExternalLink,
    RotateCcw,
    History,
    BookOpenCheck,
} from "lucide-react";
import * as articleService from "../../services/articleService";
import { useMyArticles, usePublicProfile, useReadHistory } from "../../hooks/queries/useArticles";
import { useFollowSummary, useFollowing } from "../../hooks/queries/useFollows";
import ProfileForm from "../profile-form/ProfileForm";
import FollowingList from "../following-list/FollowingList";
import ConfirmModal from "../common/ConfirmModal";
import { useAuth } from "../../contexts/AuthContext";
import PageMeta from "../page-meta/PageMeta";
import { queryKeys } from "../../lib/queryKeys";
import Skeleton from "../skeleton/Skeleton";
import { DEFAULT_AVATAR, handleAvatarError, handleImgError } from "../../utils/imageHelpers";
import { formatMonthYear, timeAgo } from "../../utils/formatters";
import { toast } from "../../lib/toast";

const QUICK_LINKS = [
    { to: '/feed', label: 'Your Feed', Icon: Users },
    { to: '/my-articles', label: 'My Articles', Icon: FileText },
    { to: '/my-collections', label: 'My Collections', Icon: Library },
    { to: '/bookmarks', label: 'Bookmarks', Icon: Bookmark },
];

export default function Profile() {
    const { userId, username, profilePicture } = useAuth();
    const queryClient = useQueryClient();
    const [showResetModal, setShowResetModal] = useState(false);
    const [isResetting, setIsResetting] = useState(false);

    const { data: myArticles, isPending: articlesPending } = useMyArticles();
    const { data: publicProfile, isPending: profilePending } = usePublicProfile(userId);
    const { data: followSummary } = useFollowSummary('user', userId);
    const { data: following } = useFollowing();
    const { data: readHistory = [], isPending: isHistoryPending } = useReadHistory();

    const isLoading = articlesPending || (!!userId && profilePending);

    const stats = [
        { label: 'Published', value: myArticles?.filter(a => a.status === 'published').length ?? 0 },
        { label: 'Drafts', value: myArticles?.filter(a => a.status === 'draft').length ?? 0 },
        { label: 'Likes Received', value: publicProfile?.totalLikes ?? 0 },
        { label: 'Followers', value: followSummary?.followers ?? 0 },
        {
            label: 'Following',
            value: (following?.users.length ?? 0) + (following?.collections.length ?? 0),
        },
    ];

    const handleSaveSuccess = () => {
        toast.success('Profile updated successfully.');
    };

    const handleResetReadHistory = async () => {
        if (isResetting) return;
        setIsResetting(true);
        try {
            const result = await articleService.resetReadHistory();
            queryClient.invalidateQueries({ queryKey: queryKeys.articles.all });
            toast.success(
                result.cleared === 0
                    ? 'Your reading history was already empty.'
                    : `Cleared reading progress for ${result.cleared} article${result.cleared === 1 ? '' : 's'}.`
            );
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Couldn't reset your reading history. Try again.");
        } finally {
            setIsResetting(false);
            setShowResetModal(false);
        }
    };

    return (
        <section id="profile-page" className="page-content">
            <PageMeta title="Profile" description="Manage your account, profile picture, and reading history." />

            {showResetModal && (
                <ConfirmModal
                    title="Reset reading history?"
                    message="This will clear every article you've marked as read."
                    subMessage="Every article will show as unread again. This cannot be undone."
                    confirmLabel={isResetting ? 'Clearing…' : 'Reset History'}
                    onConfirm={handleResetReadHistory}
                    onCancel={() => !isResetting && setShowResetModal(false)}
                />
            )}

            <header className="profile-hero">
                <div className="profile-hero-glow" />

                <div className="profile-hero-id">
                    <img
                        src={profilePicture || DEFAULT_AVATAR}
                        alt=""
                        className="profile-hero-avatar"
                        onError={handleAvatarError}
                    />
                    <div className="profile-hero-text">
                        <span className="profile-hero-kicker">Your account</span>
                        <h1 className="profile-hero-name">{username}</h1>
                        {publicProfile?.joinedAt && (
                            <p className="profile-hero-meta">
                                Member since {formatMonthYear(publicProfile.joinedAt)}
                            </p>
                        )}
                    </div>
                </div>

                <nav className="profile-hero-links">
                    {userId && (
                        <Link to={`/users/${userId}`} className="profile-hero-link profile-hero-link--primary">
                            <ExternalLink size={14} strokeWidth={2.2} />
                            View public profile
                        </Link>
                    )}
                    {QUICK_LINKS.map(({ to, label, Icon }) => (
                        <Link key={to} to={to} className="profile-hero-link">
                            <Icon size={14} strokeWidth={2.2} />
                            {label}
                        </Link>
                    ))}
                </nav>
            </header>

            <div className="profile-stats-row">
                {stats.map(stat => (
                    <div key={stat.label} className="profile-stat-card">
                        <span className="profile-stat-value">{isLoading ? '—' : stat.value}</span>
                        <span className="profile-stat-label">{stat.label}</span>
                    </div>
                ))}
            </div>

            <div className="profile-grid">
                <ProfileForm onSaveSuccess={handleSaveSuccess} />

                <div className="profile-side">
                    <FollowingList />

                    <div className="profile-panel">
                        <div className="profile-panel-head">
                            <span className="profile-panel-icon">
                                <History size={16} strokeWidth={2} />
                            </span>
                            <div>
                                <h2>Reading history</h2>
                                <p>
                                    {readHistory.length > 0
                                        ? `${readHistory.length} article${readHistory.length === 1 ? '' : 's'} marked as read.`
                                        : "Articles you mark as read collect here."}
                                </p>
                            </div>
                        </div>

                        {isHistoryPending ? (
                            <div className="read-history-list">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="read-history-row">
                                        <Skeleton className="read-history-thumb" />
                                        <div className="read-history-body">
                                            <Skeleton className="read-history-line" />
                                            <Skeleton className="read-history-line read-history-line--short" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : readHistory.length === 0 ? (
                            <div className="read-history-empty">
                                <BookOpenCheck size={26} strokeWidth={1.6} />
                                <p>Nothing read yet. Open an article and mark it as read.</p>
                                <Link to="/articles" className="read-history-cta">Browse articles →</Link>
                            </div>
                        ) : (
                            <ul className="read-history-list">
                                {readHistory.map(article => (
                                    <li key={article._id}>
                                        <Link
                                            to={`/articles/${article._id}/details`}
                                            className="read-history-row"
                                        >
                                            <img
                                                src={article.imageUrl}
                                                alt=""
                                                className="read-history-thumb"
                                                loading="lazy"
                                                decoding="async"
                                                onError={handleImgError}
                                            />
                                            <span className="read-history-body">
                                                <span className="read-history-title">{article.title}</span>
                                                <span className="read-history-meta">
                                                    {article.category} · read {timeAgo(article.readAt)}
                                                </span>
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}

                        <button
                            type="button"
                            className="profile-reset-btn"
                            onClick={() => setShowResetModal(true)}
                            disabled={isResetting || readHistory.length === 0}
                        >
                            <RotateCcw size={16} strokeWidth={2} />
                            Reset Reading History
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
