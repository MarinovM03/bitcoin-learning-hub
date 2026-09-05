import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Check, X, Trash2, ExternalLink, Flag } from 'lucide-react';
import { useAdminReports } from '../../hooks/queries/useAdmin';
import {
    useResolveReport,
    useAdminDeleteArticle,
    useAdminDeleteComment,
    useAdminDeleteGlossaryTerm,
} from '../../hooks/mutations/useAdminMutations';
import type { AdminReportRow, ReportStatus } from '../../services/adminService';
import ConfirmModal from '../common/ConfirmModal';
import Spinner from '../spinner/Spinner';
import { formatDateTime } from '../../utils/formatters';
import { toast } from '../../lib/toast';

const PAGE_LIMIT = 20;

const REASON_LABELS: Record<string, string> = {
    scam: 'Scam or phishing',
    spam: 'Spam or advertising',
    misinformation: 'Misleading or incorrect',
    abuse: 'Abusive or hateful',
    other: 'Something else',
};

const TARGET_LABELS: Record<string, string> = {
    article: 'Article',
    comment: 'Comment',
    glossary: 'Glossary term',
};

interface AdminReportsProps {
    onOpenCountChange?: (count: number) => void;
}

export default function AdminReports({ onOpenCountChange }: AdminReportsProps) {
    const [status, setStatus] = useState<ReportStatus>('open');
    const [page, setPage] = useState(1);
    const [busyId, setBusyId] = useState<string | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<AdminReportRow | null>(null);

    const { data, error: loadError } = useAdminReports({ page, limit: PAGE_LIMIT, status });

    const resolveReport = useResolveReport();
    const removeArticle = useAdminDeleteArticle();
    const removeComment = useAdminDeleteComment();
    const removeTerm = useAdminDeleteGlossaryTerm();

    const error = loadError?.message || '';
    const openTotal = data?.openTotal;

    useEffect(() => {
        if (openTotal !== undefined) onOpenCountChange?.(openTotal);
    }, [openTotal, onOpenCountChange]);

    const runAction = async (id: string, action: () => Promise<unknown>, message: string) => {
        setBusyId(id);
        try {
            await action();
            toast.success(message);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setBusyId(null);
        }
    };

    const removeReportedContent = async () => {
        if (!deleteTarget) return;
        const target = deleteTarget;
        setDeleteTarget(null);

        const remove = () => {
            if (target.targetType === 'article') return removeArticle.mutateAsync(target.targetId);
            if (target.targetType === 'comment') return removeComment.mutateAsync(target.targetId);
            return removeTerm.mutateAsync(target.targetId);
        };

        await runAction(target._id, remove, 'Content deleted.');
    };

    const targetLink = (report: AdminReportRow) => {
        if (report.targetType === 'article') return `/articles/${report.targetId}/details`;
        if (report.targetType === 'glossary') return `/glossary/${report.targetId}`;
        return report.target?.articleId ? `/articles/${report.target.articleId}/details` : null;
    };

    if (!data) {
        return error ? <p className="admin-error">{error}</p> : <Spinner />;
    }

    return (
        <div className="admin-reports-wrap">
            {deleteTarget && (
                <ConfirmModal
                    title="Delete reported content?"
                    message={`This permanently removes the ${TARGET_LABELS[deleteTarget.targetType].toLowerCase()}.`}
                    subMessage={deleteTarget.target?.label}
                    confirmLabel="Delete it"
                    onConfirm={removeReportedContent}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}

            <div className="admin-toolbar">
                <div className="admin-report-filters">
                    {(['open', 'resolved', 'dismissed'] as ReportStatus[]).map((value) => (
                        <button
                            key={value}
                            type="button"
                            className={`admin-row-btn ${status === value ? 'admin-row-btn--active' : ''}`}
                            onClick={() => { setStatus(value); setPage(1); }}
                        >
                            {value[0].toUpperCase() + value.slice(1)}
                        </button>
                    ))}
                </div>
                <span className="admin-toolbar-count">
                    {data.total} {data.total === 1 ? 'report' : 'reports'}
                </span>
            </div>

            {error && <p className="admin-error">{error}</p>}

            {data.reports.length === 0 ? (
                <p className="admin-empty">
                    {status === 'open' ? 'No open reports. Nothing needs your attention.' : `No ${status} reports.`}
                </p>
            ) : (
                <ul className="admin-queue-list">
                    {data.reports.map((report) => {
                        const isBusy = busyId === report._id;
                        const link = targetLink(report);
                        return (
                            <li key={report._id} className="admin-queue-card">
                                <div className="admin-report-head">
                                    <span className="admin-report-reason">
                                        <Flag size={12} strokeWidth={2.5} />
                                        {REASON_LABELS[report.reason] ?? report.reason}
                                    </span>
                                    <span className="admin-report-type">{TARGET_LABELS[report.targetType]}</span>
                                    <span className="admin-queue-dot">·</span>
                                    <span className="admin-report-meta">
                                        by {report._reporterId?.username ?? 'deleted user'} · {formatDateTime(report.createdAt)}
                                    </span>
                                </div>

                                {report.target ? (
                                    <p className="admin-report-target">{report.target.label}</p>
                                ) : (
                                    <p className="admin-report-target admin-report-target--gone">
                                        This content has already been removed.
                                    </p>
                                )}

                                {report.note && <p className="admin-report-note">“{report.note}”</p>}

                                <div className="admin-queue-actions">
                                    {report.target && link && (
                                        <Link to={link} className="admin-row-btn" target="_blank" rel="noreferrer">
                                            <ExternalLink size={14} strokeWidth={2.25} />
                                            View
                                        </Link>
                                    )}
                                    {report.status === 'open' && (
                                        <>
                                            <button
                                                type="button"
                                                className="admin-row-btn"
                                                onClick={() => runAction(
                                                    report._id,
                                                    () => resolveReport.mutateAsync({ reportId: report._id, status: 'dismissed' }),
                                                    'Dismissed.',
                                                )}
                                                disabled={isBusy}
                                            >
                                                <X size={14} strokeWidth={2.5} />
                                                Dismiss
                                            </button>
                                            <button
                                                type="button"
                                                className="admin-row-btn admin-row-btn--approve"
                                                onClick={() => runAction(
                                                    report._id,
                                                    () => resolveReport.mutateAsync({ reportId: report._id, status: 'resolved' }),
                                                    'Marked resolved.',
                                                )}
                                                disabled={isBusy}
                                            >
                                                <Check size={14} strokeWidth={2.5} />
                                                Resolve
                                            </button>
                                        </>
                                    )}
                                    {report.target && (
                                        <button
                                            type="button"
                                            className="admin-row-btn admin-row-btn--danger"
                                            onClick={() => setDeleteTarget(report)}
                                            disabled={isBusy}
                                        >
                                            <Trash2 size={14} strokeWidth={2.25} />
                                            Delete content
                                        </button>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}

            {data.totalPages > 1 && (
                <div className="admin-pagination">
                    <button type="button" className="admin-page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                        Prev
                    </button>
                    <span className="admin-page-info">Page {page} / {data.totalPages}</span>
                    <button type="button" className="admin-page-btn" onClick={() => setPage(p => Math.min(data.totalPages, p + 1))} disabled={page === data.totalPages}>
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
