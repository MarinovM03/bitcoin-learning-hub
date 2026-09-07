import { Link } from 'react-router';
import { Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useFeed } from '../../hooks/queries/useFollows';
import ArticleCard from '../article-card/ArticleCard';
import HomeLatestSkeleton from '../home-latest-skeleton/HomeLatestSkeleton';

export default function FollowingFeed() {
    const { isAuthenticated } = useAuth();
    const { data, isPending } = useFeed(isAuthenticated);

    if (!isAuthenticated) return null;
    if (!isPending && (data?.following ?? 0) === 0) return null;

    const articles = data?.articles ?? [];

    return (
        <div className="following-feed">
            <div className="section-heading">
                <h2>
                    <Users size={20} strokeWidth={2} className="section-heading-icon" />
                    From People You Follow
                </h2>
                <div className="section-heading-line" />
                <Link to="/articles" className="section-heading-link">
                    View all →
                </Link>
            </div>

            {isPending ? (
                <HomeLatestSkeleton />
            ) : articles.length === 0 ? (
                <p className="no-articles">
                    Nothing new yet from the accounts and collections you follow.
                </p>
            ) : (
                <div className="catalog-grid">
                    {articles.map(article => (
                        <ArticleCard key={article._id} article={article} />
                    ))}
                </div>
            )}
        </div>
    );
}
