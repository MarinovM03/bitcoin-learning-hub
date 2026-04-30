import { useEffect, useState } from 'react';
import * as adminService from '../../services/adminService';
import Spinner from '../spinner/Spinner';

const STAT_CARDS = (data) => [
    { label: 'Users', value: data.users.total, sub: `${data.users.lastWeek} new this week · ${data.users.admins} admin` },
    { label: 'Articles', value: data.articles.total, sub: `${data.articles.published} published · ${data.articles.drafts} drafts · ${data.articles.featured} featured` },
    { label: 'Comments', value: data.comments.total, sub: `${data.comments.lastWeek} new this week` },
    { label: 'Glossary Terms', value: data.glossary.total, sub: 'Across all categories' },
    { label: 'Learning Paths', value: data.paths.total, sub: 'Curated journeys' },
    { label: 'Bookmarks', value: data.bookmarks.total, sub: 'Total saves' },
    { label: 'Likes', value: data.likes.total, sub: 'Lifetime likes' },
];

export default function AdminStats() {
    const [stats, setStats] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        adminService.getStats()
            .then(setStats)
            .catch(err => setError(err.message));
    }, []);

    if (error) return <p className="admin-error">{error}</p>;
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
