import { useAdminStats } from '../../hooks/queries/useAdmin';
import type { AdminStats as AdminStatsData } from '../../services/adminService';
import Spinner from '../spinner/Spinner';

const STAT_CARDS = (data: AdminStatsData) => [
    { label: 'Users', value: data.users.total, sub: `${data.users.lastWeek} new this week · ${data.users.admins} admin` },
    { label: 'Articles', value: data.articles.total, sub: `${data.articles.published} published · ${data.articles.drafts} drafts · ${data.articles.featured} featured` },
    { label: 'Comments', value: data.comments.total, sub: `${data.comments.lastWeek} new this week` },
    { label: 'Glossary Terms', value: data.glossary.total, sub: 'Across all categories' },
    { label: 'Bookmarks', value: data.bookmarks.total, sub: 'Total saves' },
    { label: 'Likes', value: data.likes.total, sub: 'Lifetime likes' },
];

export default function AdminStats() {
    const { data: stats, error } = useAdminStats();

    if (error) return <p className="admin-error">{error.message}</p>;
    if (!stats) return <Spinner />;

    return (
        <div className="admin-stats-grid">
            {STAT_CARDS(stats).map(card => (
                <div key={card.label} className="admin-stat-card">
                    <span className="admin-stat-label">{card.label}</span>
                    <span className="admin-stat-value">{card.value.toLocaleString()}</span>
                    <span className="admin-stat-sub">{card.sub}</span>
                </div>
            ))}
        </div>
    );
}
