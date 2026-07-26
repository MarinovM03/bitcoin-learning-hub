import { useCallback, useEffect, useState } from 'react';
import { Check, X, Eye, EyeOff, Trash2, Clock, BookMarked } from 'lucide-react';
import * as adminService from '../../services/adminService';
import type {
    ModerationQueueResponse,
    ModerationArticle,
    ModerationTerm,
    ArticlePreview,
} from '../../services/adminService';
import MarkdownContent from '../markdown-content/MarkdownContent';
import Spinner from '../spinner/Spinner';
import ConfirmModal from '../common/ConfirmModal';
import { DEFAULT_AVATAR, handleAvatarError } from '../../utils/imageHelpers';
import { formatDateTime } from '../../utils/formatters';
import { toast } from '../../lib/toast';

const PAGE_LIMIT = 20;

interface AdminModerationProps {
    onQueueChange?: (pending: number) => void;
}

export default function AdminModeration({ onQueueChange }: AdminModerationProps) {
    const [data, setData] = useState<ModerationQueueResponse | null>(null);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [busyId, setBusyId] = useState<string | null>(null);

    const [openId, setOpenId] = useState<string | null>(null);
    const [preview, setPreview] = useState<ArticlePreview | null>(null);
    const [previewLoading, setPreviewLoading] = useState(false);

    const [rejectTarget, setRejectTarget] = useState<ModerationArticle | null>(null);
    const [rejectNote, setRejectNote] = useState('');
    const [deleteTarget, setDeleteTarget] = useState<ModerationTerm | null>(null);

    const reload = useCallback(() => {
        setError('');
        return adminService.getModerationQueue({ page, limit: PAGE_LIMIT })
            .then((res) => {
                setData(res);
                onQueueChange?.(res.articleTotal + res.termTotal);
            })
            .catch((err) => setError(err instanceof Error ? err.message : 'Something went wrong'));
    }, [page, onQueueChange]);

    useEffect(() => {
        reload();
    }, [reload]);

    const togglePreview = async (articleId: string) => {
        if (openId === articleId) {
            setOpenId(null);
            setPreview(null);
            return;
        }
        setOpenId(articleId);
        setPreview(null);
        setPreviewLoading(true);
        try {
            setPreview(await adminService.getArticlePreview(articleId));
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Could not load the article.');
            setOpenId(null);
        } finally {
            setPreviewLoading(false);
        }
    };

    const runAction = async (id: string, action: () => Promise<unknown>, successMessage: string) => {
        setBusyId(id);
        try {
            await action();
            toast.success(successMessage);
            if (openId === id) {
                setOpenId(null);
                setPreview(null);
            }
            await reload();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setBusyId(null);
        }
    };

    const confirmReject = async () => {
        if (!rejectTarget) return;
        const target = rejectTarget;
        const note = rejectNote.trim();
        setRejectTarget(null);
        setRejectNote('');
        await runAction(
            target._id,
            () => adminService.rejectArticle(target._id, note),
            'Sent back to the author as a draft.',
        );
    };

    const confirmDeleteTerm = async () => {
        if (!deleteTarget) return;
        const target = deleteTarget;
        setDeleteTarget(null);
        await runAction(
            target._id,
            () => adminService.deleteGlossaryTerm(target._id),
            'Term deleted.',
        );
    };

    if (!data) {
        return error ? <p className="admin-error">{error}</p> : <Spinner />;
    }

    const nothingWaiting = data.articles.length === 0 && data.terms.length === 0;

    return (
        <div className="admin-moderation-wrap">
            {rejectTarget && (
                <ConfirmModal
                    title="Send back to the author?"
                    message={`"${rejectTarget.title}" returns to the author as a draft. They can revise and resubmit it.`}
                    subMessage="Add an optional note explaining what needs to change."
                    confirmLabel="Send back"
                    onConfirm={confirmReject}
                    onCancel={() => { setRejectTarget(null); setRejectNote(''); }}
                >
                    <textarea
                        className="admin-reject-note"
                        placeholder="e.g. Needs sources for the claims in section 2."
                        maxLength={300}
                        rows={3}
                        value={rejectNote}
                        onChange={(e) => setRejectNote(e.target.value)}
                    />
                </ConfirmModal>
            )}

            {deleteTarget && (
                <ConfirmModal
                    title="Delete term?"
                    message={`Permanently delete "${deleteTarget.term}".`}
                    subMessage="Glossary submissions cannot be sent back, so this removes it entirely."
                    confirmLabel="Delete term"
                    onConfirm={confirmDeleteTerm}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}

            {error && <p className="admin-error">{error}</p>}

            {nothingWaiting ? (
                <p className="admin-empty">Nothing waiting for review.</p>
            ) : (
                <>
                    {data.articles.length > 0 && (
                        <section className="admin-queue-section">
                            <h2 className="admin-queue-heading">
                                <Clock size={15} strokeWidth={2.25} />
                                Articles awaiting review
                                <span className="admin-queue-count">{data.articleTotal}</span>
                            </h2>

                            <ul className="admin-queue-list">
                                {data.articles.map((article) => {
                                    const isBusy = busyId === article._id;
                                    const isOpen = openId === article._id;
                                    return (
                                        <li key={article._id} className="admin-queue-card">
                                            <div className="admin-queue-main">
                                                <img
                                                    src={article.imageUrl}
                                                    alt=""
                                                    className="admin-queue-thumb"
                                                    onError={handleAvatarError}
                                                />
                                                <div className="admin-queue-body">
                                                    <h3 className="admin-queue-title">{article.title}</h3>
                                                    <p className="admin-queue-summary">{article.summary}</p>
                                                    <div className="admin-queue-meta">
                                                        <img
                                                            src={article._ownerId?.profilePicture || DEFAULT_AVATAR}
                                                            alt=""
                                                            className="admin-queue-avatar"
                                                            onError={handleAvatarError}
                                                        />
                                                        <span className="admin-queue-author">
                                                            {article._ownerId?.username || 'Deleted user'}
                                                        </span>
                                                        <span className="admin-queue-dot">·</span>
                                                        <span>{article.category}</span>
                                                        <span className="admin-queue-dot">·</span>
                                                        <span>{article.difficulty}</span>
                                                        <span className="admin-queue-dot">·</span>
                                                        <span>{article.readingTime} min</span>
                                                        <span className="admin-queue-dot">·</span>
                                                        <span>{formatDateTime(article.createdAt)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="admin-queue-actions">
                                                <button
                                                    type="button"
                                                    className="admin-row-btn"
                                                    onClick={() => togglePreview(article._id)}
                                                    disabled={isBusy}
                                                >
                                                    {isOpen
                                                        ? <><EyeOff size={14} strokeWidth={2.25} />Hide</>
                                                        : <><Eye size={14} strokeWidth={2.25} />Read it</>}
                                                </button>
                                                <button
                                                    type="button"
                                                    className="admin-row-btn admin-row-btn--approve"
                                                    onClick={() => runAction(
                                                        article._id,
                                                        () => adminService.approveArticle(article._id),
                                                        'Published.',
                                                    )}
                                                    disabled={isBusy}
                                                >
                                                    <Check size={14} strokeWidth={2.5} />
                                                    Approve
                                                </button>
                                                <button
                                                    type="button"
                                                    className="admin-row-btn admin-row-btn--danger"
                                                    onClick={() => setRejectTarget(article)}
                                                    disabled={isBusy}
                                                >
                                                    <X size={14} strokeWidth={2.5} />
                                                    Send back
                                                </button>
                                            </div>

                                            {isOpen && (
                                                <div className="admin-queue-preview">
                                                    {previewLoading || !preview
                                                        ? <Spinner />
                                                        : <MarkdownContent content={preview.content} />}
                                                </div>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        </section>
                    )}

                    {data.terms.length > 0 && (
                        <section className="admin-queue-section">
                            <h2 className="admin-queue-heading">
                                <BookMarked size={15} strokeWidth={2.25} />
                                Glossary terms awaiting review
                                <span className="admin-queue-count">{data.termTotal}</span>
                            </h2>

                            <ul className="admin-queue-list">
                                {data.terms.map((term) => {
                                    const isBusy = busyId === term._id;
                                    return (
                                        <li key={term._id} className="admin-queue-card">
                                            <div className="admin-queue-body">
                                                <h3 className="admin-queue-title">{term.term}</h3>
                                                <p className="admin-queue-summary">{term.definition}</p>
                                                <div className="admin-queue-meta">
                                                    <span className="admin-queue-author">
                                                        {term._ownerId?.username || 'Deleted user'}
                                                    </span>
                                                    <span className="admin-queue-dot">·</span>
                                                    <span>{term.category}</span>
                                                    <span className="admin-queue-dot">·</span>
                                                    <span>{formatDateTime(term.createdAt)}</span>
                                                </div>
                                            </div>

                                            <div className="admin-queue-actions">
                                                <button
                                                    type="button"
                                                    className="admin-row-btn admin-row-btn--approve"
                                                    onClick={() => runAction(
                                                        term._id,
                                                        () => adminService.approveGlossaryTerm(term._id),
                                                        'Term published.',
                                                    )}
                                                    disabled={isBusy}
                                                >
                                                    <Check size={14} strokeWidth={2.5} />
                                                    Approve
                                                </button>
                                                <button
                                                    type="button"
                                                    className="admin-row-btn admin-row-btn--danger"
                                                    onClick={() => setDeleteTarget(term)}
                                                    disabled={isBusy}
                                                >
                                                    <Trash2 size={14} strokeWidth={2.25} />
                                                    Delete
                                                </button>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </section>
                    )}
                </>
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
