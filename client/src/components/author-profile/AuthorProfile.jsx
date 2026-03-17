import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import * as articleService from '../../services/articleService';
import Spinner from "../spinner/Spinner";
import { formatViews } from '../../utils/formatters';
import { getReadingTime } from '../../utils/readingTime';

const defaultAvatar = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

const handleImgError = (e) => {
    e.target.onerror = null;
    e.target.classList.add('img-fallback');
    e.target.removeAttribute('src');
};

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

    if (isLoading) return <Spinner />;

    const { username, profilePicture, articles, totalLikes } = profile;

    return (
        <section className="page-content author-profile-page">
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
                            <Link
                                key={article._id}
                                to={`/articles/${article._id}/details`}
                                className="catalog-card"
                            >
                                <div className="catalog-card-img-wrap">
                                    <img
                                        src={article.imageUrl}
                                        alt={article.title}
                                        className="catalog-card-img"
                                        onError={handleImgError}
                                    />
                                    <span className="catalog-card-category">{article.category}</span>
                                </div>
                                <div className="catalog-card-body">
                                    <h3 className="catalog-card-title">{article.title}</h3>
                                    <p className="catalog-card-summary">{article.summary}</p>
                                    <div className="catalog-card-footer">
                                        <span className="catalog-card-meta">{getReadingTime(article.content)} min read</span>
                                        <span className="catalog-card-meta">{formatViews(article.views ?? 0)} views</span>
                                        <span className="catalog-card-read">Read →</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}