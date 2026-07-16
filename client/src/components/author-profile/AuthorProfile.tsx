import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import * as articleService from '../../services/articleService';
import type { PublicProfile } from '../../services/articleService';
import ArticleCard from "../article-card/ArticleCard";
import AuthorProfileSkeleton from "../author-profile-skeleton/AuthorProfileSkeleton";
import { handleAvatarError, DEFAULT_AVATAR } from '../../utils/imageHelpers';
import PageMeta from "../page-meta/PageMeta";

export default function AuthorProfile() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<PublicProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;
        articleService.getPublicProfile(userId)
            .then(data => setProfile(data))
            .catch(() => navigate('/not-found'))
            .finally(() => setIsLoading(false));
    }, [userId, navigate]);

    if (isLoading) return <AuthorProfileSkeleton />;
    if (!profile) return null;

    const { username, profilePicture, articles, totalLikes } = profile;

    return (
        <section className="page-content author-profile-page">
            <PageMeta
                title={username}
                description={`Articles by ${username} on Bitcoin Learning Hub.`}
                image={profilePicture}
                type="profile"
            />
            <div className="author-profile-header">
                <img
                    src={profilePicture || DEFAULT_AVATAR}
                    alt={username}
                    className="author-profile-avatar"
                    onError={handleAvatarError}
                />
                <div className="author-profile-info">
                    <h1 className="author-profile-name">{username}</h1>
                    <p className="author-profile-role">Community Author</p>
                    <div className="author-profile-stats">
                        <div className="author-stat">
                            <span className="author-stat-value">{articles.length}</span>
                            <span className="author-stat-label">Articles</span>
                        </div>
                        <div className="author-stat">
                            <span className="author-stat-value">{totalLikes}</span>
                            <span className="author-stat-label">Likes Received</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="author-profile-articles">
                <div className="section-heading">
                    <h2>Published Articles</h2>
                    <div className="section-heading-line" />
                </div>

                {articles.length === 0 ? (
                    <p className="author-profile-empty">This author hasn't published any articles yet.</p>
                ) : (
                    <div className="catalog-grid">
                        {articles.map(article => (
                            <ArticleCard
                                key={article._id}
                                article={article}
                                readLabel="Read →"
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}