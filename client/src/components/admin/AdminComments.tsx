import { useState } from 'react';
import { Link } from 'react-router';
import { Trash2, ExternalLink } from 'lucide-react';
import { useAdminComments } from '../../hooks/queries/useAdmin';
import { useAdminDeleteComment } from '../../hooks/mutations/useAdminMutations';
import type { AdminCommentRow } from '../../services/adminService';
import ConfirmModal from '../common/ConfirmModal';
import Spinner from '../spinner/Spinner';
import { DEFAULT_AVATAR, handleAvatarError } from '../../utils/imageHelpers';
import { formatDateTime } from '../../utils/formatters';

const PAGE_LIMIT = 20;
export default function AdminComments() {
    const [page, setPage] = useState(1);
    const [actionError, setActionError] = useState('');
    const [deleteTarget, setDeleteTarget] = useState<AdminCommentRow | null>(null);

    const { data, error: loadError } = useAdminComments({ page, limit: PAGE_LIMIT });
    const deleteComment = useAdminDeleteComment();

    const error = actionError || loadError?.message || '';
    const pendingId = deleteComment.isPending ? deleteComment.variables : null;

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setActionError('');
        try {
            await deleteComment.mutateAsync(deleteTarget._id);
            setDeleteTarget(null);
        } catch (err) {
            setActionError(err instanceof Error ? err.message : 'Something went wrong');
        }
    };

    return (
        <div className="admin-comments-wrap">
            {deleteTarget && (
                <ConfirmModal
                    title="Delete Comment?"
                    message="Permanently delete this comment."
                    subMessage={`"${deleteTarget.text.slice(0, 120)}${deleteTarget.text.length > 120 ? '…' : ''}"`}
                    confirmLabel="Delete Comment"
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}

            <div className="admin-toolbar">
                {data && (
                    <span className="admin-toolbar-count">
                        {data.total} {data.total === 1 ? 'comment' : 'comments'}
                    </span>
                )}
            </div>

            {error && <p className="admin-error">{error}</p>}

            {!data ? (
                <Spinner />
            ) : data.comments.length === 0 ? (
                <p className="admin-empty">No comments yet.</p>
            ) : (
                <ul className="admin-comments-list">
                    {data.comments.map(comment => {
                        const isPending = pendingId === comment._id;
                        const author = comment._ownerId;
                        const article = comment.articleId;
                        return (
                            <li key={comment._id} className="admin-comment-card">
                                <div className="admin-comment-head">
                                    <img
                                        src={author?.profilePicture || DEFAULT_AVATAR}
                                        alt=""
                                        className="admin-comment-avatar"
                                        onError={handleAvatarError}
                                    />
                                    <div className="admin-comment-meta">
                                        <span className="admin-comment-author">{author?.username || 'Deleted user'}</span>
                                        <span className="admin-comment-time">{formatDateTime(comment.createdAt)}</span>
                                    </div>
                                    {article && (
                                        <Link
                                            to={`/articles/${article._id}/details`}
                                            className="admin-comment-article-link"
                                            title={article.title}
                                        >
                                            <ExternalLink size={12} strokeWidth={2.25} />
                                            {article.title.length > 40 ? article.title.slice(0, 40) + '…' : article.title}
                                        </Link>
                                    )}
                                </div>
                                <p className="admin-comment-text">{comment.text}</p>
                                <div className="admin-comment-footer">
                                    <button
                                        type="button"
                                        className="admin-row-btn admin-row-btn--danger"
                                        onClick={() => setDeleteTarget(comment)}
                                        disabled={isPending}
                                    >
                                        <Trash2 size={14} strokeWidth={2.25} />
                                        Delete
                                    </button>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}

            {data && data.totalPages > 1 && (
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
