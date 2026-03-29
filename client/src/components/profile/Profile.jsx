import { useEffect, useState } from "react";
import * as articleService from "../../services/articleService";
import * as likeService from "../../services/likeService";
import ProfileForm from "../profile-form/ProfileForm";
import MyArticlesList from "../my-articles-list/MyArticlesList";
import { useAuth } from "../../contexts/AuthContext";

export default function Profile() {
    const { userId } = useAuth();
    const [showToast, setShowToast] = useState(false);
    const [myArticles, setMyArticles] = useState([]);
    const [articlesLoading, setArticlesLoading] = useState(true);
    const [totalLikes, setTotalLikes] = useState(0);

    useEffect(() => {
        articleService.getMyArticles()
            .then(async (result) => {
                setMyArticles(result);

                const published = result.filter(a => a.status === 'published');
                const likeCounts = await Promise.all(
                    published.map(a => likeService.getAllForArticle(a._id).then(likes => likes.length).catch(() => 0))
                );
                setTotalLikes(likeCounts.reduce((sum, n) => sum + n, 0));
            })
            .catch(err => console.log("Failed to load articles:", err.message))
            .finally(() => setArticlesLoading(false));
    }, [userId]);

    const handleSaveSuccess = () => {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const handleArticleDeleted = (articleId) => {
        setMyArticles(prev => prev.filter(a => a._id !== articleId));
    };

    const publishedArticles = myArticles.filter(a => a.status === 'published');
    const draftArticles = myArticles.filter(a => a.status === 'draft');

    return (
        <section id="profile-page" className="page-content">
            {showToast && (
                <div className="profile-toast">
                    ✅ Profile updated successfully!
                </div>
            )}

            <ProfileForm onSaveSuccess={handleSaveSuccess} />

            <div className="profile-articles-section" id="my-articles">
                <div className="profile-stats-row">
                    <div className="profile-stat-card">
                        <span className="profile-stat-value">{publishedArticles.length}</span>
                        <span className="profile-stat-label">Articles Published</span>
                    </div>
                    <div className="profile-stat-card">
                        <span className="profile-stat-value">{draftArticles.length}</span>
                        <span className="profile-stat-label">Drafts Saved</span>
                    </div>
                    <div className="profile-stat-card">
                        <span className="profile-stat-value">{totalLikes}</span>
                        <span className="profile-stat-label">Likes Received</span>
                    </div>
                </div>

                <MyArticlesList
                    publishedArticles={publishedArticles}
                    draftArticles={draftArticles}
                    isLoading={articlesLoading}
                    onArticleDeleted={handleArticleDeleted}
                />
            </div>
        </section>
    );
}