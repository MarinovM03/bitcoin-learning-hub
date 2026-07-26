import { useCallback, useEffect, useState } from 'react';
import { ShieldCheck, BarChart3, Users, FileText, MessageSquare, ClipboardCheck, Flag } from 'lucide-react';
import PageMeta from '../page-meta/PageMeta';
import AdminStats from './AdminStats';
import AdminUsers from './AdminUsers';
import AdminArticles from './AdminArticles';
import AdminComments from './AdminComments';
import AdminModeration from './AdminModeration';
import AdminReports from './AdminReports';
import * as adminService from '../../services/adminService';

const TABS = [
    { id: 'review', label: 'Review', Icon: ClipboardCheck },
    { id: 'reports', label: 'Reports', Icon: Flag },
    { id: 'stats', label: 'Stats', Icon: BarChart3 },
    { id: 'users', label: 'Users', Icon: Users },
    { id: 'articles', label: 'Articles', Icon: FileText },
    { id: 'comments', label: 'Comments', Icon: MessageSquare },
];

export default function Admin() {
    const [tab, setTab] = useState('review');
    const [pending, setPending] = useState(0);
    const [openReports, setOpenReports] = useState(0);

    useEffect(() => {
        adminService.getModerationQueue({ limit: 1 })
            .then((res) => setPending(res.articleTotal + res.termTotal))
            .catch(() => setPending(0));
        adminService.getReports({ limit: 1 })
            .then((res) => setOpenReports(res.openTotal))
            .catch(() => setOpenReports(0));
    }, []);

    const handleQueueChange = useCallback((count: number) => setPending(count), []);
    const handleReportCountChange = useCallback((count: number) => setOpenReports(count), []);

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
                            {id === 'review' && pending > 0 && (
                                <span className="admin-tab-badge" aria-label={`${pending} awaiting review`}>
                                    {pending}
                                </span>
                            )}
                            {id === 'reports' && openReports > 0 && (
                                <span className="admin-tab-badge" aria-label={`${openReports} open reports`}>
                                    {openReports}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                <div className="admin-tab-panel">
                    {tab === 'review' && <AdminModeration onQueueChange={handleQueueChange} />}
                    {tab === 'reports' && <AdminReports onOpenCountChange={handleReportCountChange} />}
                    {tab === 'stats' && <AdminStats />}
                    {tab === 'users' && <AdminUsers />}
                    {tab === 'articles' && <AdminArticles />}
                    {tab === 'comments' && <AdminComments />}
                </div>
            </div>
        </section>
    );
}
