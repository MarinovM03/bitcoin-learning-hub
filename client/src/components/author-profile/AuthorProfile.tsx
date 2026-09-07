import { useParams } from "react-router";
import { usePublicProfile } from '../../hooks/queries/useArticles';
import { useFollowSummary } from '../../hooks/queries/useFollows';
import FollowButton from '../follow-button/FollowButton';
import ArticleCard from "../article-card/ArticleCard";
import AuthorProfileSkeleton from "../author-profile-skeleton/AuthorProfileSkeleton";
import NotFound from "../not-found/NotFound";
import { handleAvatarError, DEFAULT_AVATAR } from '../../utils/imageHelpers';
import { formatMonthYear } from '../../utils/formatters';
import PageMeta from "../page-meta/PageMeta";

export default function AuthorProfile() {
    const { userId } = useParams();
    const { data: profile, isPending, isError } = usePublicProfile(userId);
    const { data: followSummary } = useFollowSummary('user', userId);

    if (isError) return <NotFound />;
    if (isPending || !profile) return <AuthorProfileSkeleton />;

    const { username, profilePicture, joinedAt, articles, totalLikes } = profile;

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
                    <p className="author-profile-role">
                        Community Author
                        {joinedAt && ` · Member since ${formatMonthYear(joinedAt)}`}
                    </p>
                    <div className="author-profile-stats">
                        <div className="author-stat">
                            <span className="author-stat-value">{articles.length}</span>
                            <span className="author-stat-label">Articles</span>
                        </div>
                        <div className="author-stat">
                            <span className="author-stat-value">{totalLikes}</span>
                            <span className="author-stat-label">Likes Received</span>
                        </div>
                        <div className="author-stat">
                            <span className="author-stat-value">{followSummary?.followers ?? 0}</span>
                            <span className="author-stat-label">Followers</span>
                        </div>
                    </div>

                    {userId && <FollowButton targetType="user" targetId={userId} ownerId={userId} />}
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