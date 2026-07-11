import { useEffect, useState } from "react";
import { Link } from "react-router";
import { FileText, ArrowRight, RotateCcw } from "lucide-react";
import * as articleService from "../../services/articleService";
import * as likeService from "../../services/likeService";
import ProfileForm from "../profile-form/ProfileForm";
import ConfirmModal from "../common/ConfirmModal";
import { useAuth } from "../../contexts/AuthContext";
import PageMeta from "../page-meta/PageMeta";
import { toast } from "../../lib/toast";

export default function Profile() {
    const { userId } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [publishedCount, setPublishedCount] = useState(0);
    const [draftCount, setDraftCount] = useState(0);
    const [totalLikes, setTotalLikes] = useState(0);
    const [showResetModal, setShowResetModal] = useState(false);
    const [isResetting, setIsResetting] = useState(false);

    useEffect(() => {
        articleService.getMyArticles()
            .then(async (result) => {
                const published = result.filter(a => a.status === 'published');
                const drafts = result.filter(a => a.status === 'draft');
                setPublishedCount(published.length);
                setDraftCount(drafts.length);

                const likeCounts = await Promise.all(
                    published.map(a =>
                        likeService.getAllForArticle(a._id).then(likes => likes.length).catch(() => 0)
                    )
                );
                setTotalLikes(likeCounts.reduce((sum, n) => sum + n, 0));
            })
            .catch(() => { /* stats fail silently — profile form is the primary content */ })
            .finally(() => setIsLoading(false));
    }, [userId]);

    const handleSaveSuccess = () => {
        toast.success('Profile updated successfully.');
    };

    const handleResetReadHistory = async () => {
        if (isResetting) return;
        setIsResetting(true);
        try {
            const result = await articleService.resetReadHistory();
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
                    subMessage="Learning paths will show all articles as unread and the Final Exam gates will lock again until you re-mark them. This cannot be undone."
                    confirmLabel={isResetting ? 'Clearing…' : 'Reset History'}
                    onConfirm={handleResetReadHistory}
                    onCancel={() => !isResetting && setShowResetModal(false)}
                />
            )}

            <ProfileForm onSaveSuccess={handleSaveSuccess} />

            <div className="profile-articles-section">
                <div className="profile-stats-row">
                    <div className="profile-stat-card">
                        <span className="profile-stat-value">{isLoading ? '—' : publishedCount}</span>
                        <span className="profile-stat-label">Published</span>
                    </div>
                    <div className="profile-stat-card">
                        <span className="profile-stat-value">{isLoading ? '—' : draftCount}</span>
                        <span className="profile-stat-label">Drafts</span>
                    </div>
                    <div className="profile-stat-card">
                        <span className="profile-stat-value">{isLoading ? '—' : totalLikes}</span>
                        <span className="profile-stat-label">Likes Received</span>
                    </div>
                </div>

                <Link to="/my-articles" className="profile-manage-btn">
                    <FileText size={16} strokeWidth={2} />
                    Manage My Articles
                    <ArrowRight size={16} strokeWidth={2} />
                </Link>

                <button
                    type="button"
                    className="profile-reset-btn"
                    onClick={() => setShowResetModal(true)}
                    disabled={isResetting}
                >
                    <RotateCcw size={16} strokeWidth={2} />
                    Reset Reading History
                </button>
            </div>
        </section>
    );
}