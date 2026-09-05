import { useState } from "react";
import { Link } from "react-router";
import { FileText, ArrowRight, RotateCcw } from "lucide-react";
import * as articleService from "../../services/articleService";
import { useMyArticles, usePublicProfile } from "../../hooks/queries/useArticles";
import ProfileForm from "../profile-form/ProfileForm";
import ConfirmModal from "../common/ConfirmModal";
import { useAuth } from "../../contexts/AuthContext";
import PageMeta from "../page-meta/PageMeta";
import { toast } from "../../lib/toast";

export default function Profile() {
    const { userId } = useAuth();
    const [showResetModal, setShowResetModal] = useState(false);
    const [isResetting, setIsResetting] = useState(false);

    const { data: myArticles, isPending: articlesPending } = useMyArticles();
    const { data: publicProfile, isPending: profilePending } = usePublicProfile(userId);

    const publishedCount = myArticles?.filter(a => a.status === 'published').length ?? 0;
    const draftCount = myArticles?.filter(a => a.status === 'draft').length ?? 0;
    const totalLikes = publicProfile?.totalLikes ?? 0;
    const isLoading = articlesPending || (!!userId && profilePending);

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
                    subMessage="Every article will show as unread again. This cannot be undone."
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