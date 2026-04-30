import { useState } from 'react';
import { ShieldCheck, BarChart3, Users, FileText, MessageSquare } from 'lucide-react';
import PageMeta from '../page-meta/PageMeta';
import AdminStats from './AdminStats';
import AdminUsers from './AdminUsers';
import AdminArticles from './AdminArticles';
import AdminComments from './AdminComments';

const TABS = [
    { id: 'stats', label: 'Stats', Icon: BarChart3 },
    { id: 'users', label: 'Users', Icon: Users },
    { id: 'articles', label: 'Articles', Icon: FileText },
    { id: 'comments', label: 'Comments', Icon: MessageSquare },
];

export default function Admin() {
    const [tab, setTab] = useState('stats');

    return (
        <section id="admin-page" className="page-content">
            <PageMeta title="Admin Dashboard" description="Platform administration." />
            <div className="admin-page">
                <header className="admin-header">
                    <span className="admin-kicker">
                        <ShieldCheck size={14} strokeWidth={2.5} />
                        Admin
                    </span>
                    <h1>Dashboard</h1>
                    <p className="admin-subtitle">Platform stats, user management, and content moderation.</p>
                </header>

                <div className="admin-tabs" role="tablist">
                    {TABS.map(({ id, label, Icon }) => (
                        <button
                            key={id}
                            type="button"
                            role="tab"
                            aria-selected={tab === id}
                            className={`admin-tab ${tab === id ? 'admin-tab--active' : ''}`}
                            onClick={() => setTab(id)}
                        >
                            <Icon size={14} strokeWidth={2.25} />
                            {label}
                        </button>
                    ))}
                </div>

                <div className="admin-tab-panel">
                    {tab === 'stats' && <AdminStats />}
                    {tab === 'users' && <AdminUsers />}
                    {tab === 'articles' && <AdminArticles />}
                    {tab === 'comments' && <AdminComments />}
                </div>
            </div>
        </section>
    );
}
