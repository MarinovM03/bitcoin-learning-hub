import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import * as articleService from '../../services/articleService';
import ArticleCard from "../article-card/ArticleCard";
import AuthorProfileSkeleton from "../author-profile-skeleton/AuthorProfileSkeleton";
import { handleImgError } from "../../utils/imageHelpers";
import PageMeta from "../page-meta/PageMeta";

const defaultAvatar = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

export default function AuthorProfile() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        articleService.getPublicProfile(userId)
            .then(data => setProfile(data))
            .catch(() => navigate('/not-found'))
            .finally(() => setIsLoading(false));
    }, [userId, navigate]);

    if (isLoading) return <AuthorProfileSkeleton />;

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
                    src={profilePicture || defaultAvatar}
                    alt={username}
                    className="author-profile-avatar"
                    onError={handleImgError}
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