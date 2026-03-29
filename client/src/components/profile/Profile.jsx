import { useEffect, useState } from "react";
import * as articleService from "../../services/articleService";
import * as likeService from "../../services/likeService";
import ProfileForm from "../profile-form/ProfileForm";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router";

export default function Profile() {
    const { userId } = useAuth();
    const [showToast, setShowToast] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [publishedCount, setPublishedCount] = useState(0);
    const [draftCount, setDraftCount] = useState(0);
    const [totalLikes, setTotalLikes] = useState(0);

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
            .catch(err => console.log("Failed to load articles:", err.message))
            .finally(() => setIsLoading(false));
    }, [userId]);

    const handleSaveSuccess = () => {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    return (
        <section id="profile-page" className="page-content">
            {showToast && (
                <div className="profile-toast">
                    ✅ Profile updated successfully!
                </div>
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
                    📰 Manage My Articles →
                </Link>
            </div>
        </section>
    );
}