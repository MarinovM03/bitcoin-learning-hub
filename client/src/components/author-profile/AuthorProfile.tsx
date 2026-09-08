import { Link, useParams } from "react-router";
import { FileText, Layers, ArrowRight } from "lucide-react";
import { usePublicProfile } from '../../hooks/queries/useArticles';
import { useFollowSummary } from '../../hooks/queries/useFollows';
import { useCollections } from '../../hooks/queries/useCollections';
import FollowButton from '../follow-button/FollowButton';
import ArticleCard from "../article-card/ArticleCard";
import AuthorProfileSkeleton from "../author-profile-skeleton/AuthorProfileSkeleton";
import NotFound from "../not-found/NotFound";
import { handleAvatarError, handleImgError, DEFAULT_AVATAR } from '../../utils/imageHelpers';
import { formatMonthYear } from '../../utils/formatters';
import PageMeta from "../page-meta/PageMeta";

export default function AuthorProfile() {
    const { userId } = useParams();
    const { data: profile, isPending, isError } = usePublicProfile(userId);
    const { data: followSummary } = useFollowSummary('user', userId);
    const { data: collections = [] } = useCollections(userId);

    if (isError) return <NotFound />;
    if (isPending || !profile) return <AuthorProfileSkeleton />;

    const { username, profilePicture, joinedAt, articles, totalLikes } = profile;

    const stats = [
        { label: 'Articles', value: articles.length },
        { label: 'Likes Received', value: totalLikes },
        { label: 'Followers', value: followSummary?.followers ?? 0 },
    ];

    return (
        <section className="page-content author-profile-page">
            <PageMeta
                title={username}
                description={`Articles by ${username} on Bitcoin Learning Hub.`}
                image={profilePicture}
                type="profile"
            />

            <header className="author-hero">
                <div className="author-hero-glow" />

                <div className="author-hero-id">
                    <img
                        src={profilePicture || DEFAULT_AVATAR}
                        alt=""
                        className="author-hero-avatar"
                        onError={handleAvatarError}
                    />
                    <div className="author-hero-text">
                        <span className="author-hero-kicker">Community Author</span>
                        <h1 className="author-hero-name">{username}</h1>
                        {joinedAt && (
                            <p className="author-hero-meta">Member since {formatMonthYear(joinedAt)}</p>
                        )}
                    </div>
                </div>

                {userId && <FollowButton targetType="user" targetId={userId} ownerId={userId} />}
            </header>

            <div className="author-stats-row">
                {stats.map(stat => (
                    <div key={stat.label} className="author-stat-card">
                        <span className="author-stat-value">{stat.value}</span>
                        <span className="author-stat-label">{stat.label}</span>
                    </div>
                ))}
            </div>

            {collections.length > 0 && (
                <div className="author-collections">
                    <div className="section-heading">
                        <h2>
                            <Layers size={20} strokeWidth={2} className="section-heading-icon" />
                            Reading Paths
                        </h2>
                        <div className="section-heading-line" />
                    </div>

                    <div className="author-collection-row">
                        {collections.map(collection => (
                            <Link
                                key={collection._id}
                                to={`/collections/${collection.slug}`}
                                className="author-collection"
                            >
                                {collection.coverImage ? (
                                    <img
                                        src={collection.coverImage}
                                        alt=""
                                        className="author-collection-cover"
                                        loading="lazy"
                                        decoding="async"
                                        onError={handleImgError}
                                    />
                                ) : (
                                    <span className="author-collection-cover author-collection-cover--blank">
                                        <Layers size={18} strokeWidth={1.8} />
                                    </span>
                                )}
                                <span className="author-collection-body">
                                    <span className="author-collection-title">{collection.title}</span>
                                    <span className="author-collection-meta">
                                        {collection.articleCount} {collection.articleCount === 1 ? 'part' : 'parts'}
                                    </span>
                                </span>
                                <ArrowRight size={15} strokeWidth={2.25} className="author-collection-arrow" />
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            <div className="author-profile-articles">
                <div className="section-heading">
                    <h2>
                        <FileText size={20} strokeWidth={2} className="section-heading-icon" />
                        Published Articles
                    </h2>
                    <div className="section-heading-line" />
                </div>

                {articles.length === 0 ? (
                    <div className="author-profile-empty">
                        <FileText size={30} strokeWidth={1.5} />
                        <p>{username} hasn't published anything yet.</p>
                    </div>
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
