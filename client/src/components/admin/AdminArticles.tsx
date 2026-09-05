import { useState } from 'react';
import { Link } from 'react-router';
import { Search, Star, Trash2, Eye } from 'lucide-react';
import { useAdminArticles } from '../../hooks/queries/useAdmin';
import { useToggleFeatured, useAdminDeleteArticle } from '../../hooks/mutations/useAdminMutations';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import type { AdminArticleRow } from '../../services/adminService';
import ConfirmModal from '../common/ConfirmModal';
import Spinner from '../spinner/Spinner';

const PAGE_LIMIT = 20;

export default function AdminArticles() {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [actionError, setActionError] = useState('');
    const [deleteTarget, setDeleteTarget] = useState<AdminArticleRow | null>(null);

    const debouncedSearch = useDebouncedValue(search);
    const { data, error: loadError } = useAdminArticles({ search: debouncedSearch, page, limit: PAGE_LIMIT });

    const toggleFeatured = useToggleFeatured();
    const removeArticle = useAdminDeleteArticle();

    const error = actionError || loadError?.message || '';
    const pendingId = (toggleFeatured.isPending && toggleFeatured.variables)
        || (removeArticle.isPending && removeArticle.variables)
        || null;

    const run = async (action: () => Promise<unknown>) => {
        setActionError('');
        try {
            await action();
        } catch (err) {
            setActionError(err instanceof Error ? err.message : 'Something went wrong');
        }
    };

    const handleToggleFeatured = (article: AdminArticleRow) =>
        run(() => toggleFeatured.mutateAsync(article._id));

    const handleDelete = async () => {
        if (!deleteTarget) return;
        await run(async () => {
            await removeArticle.mutateAsync(deleteTarget._id);
            setDeleteTarget(null);
        });
    };

    return (
        <div className="admin-table-wrap">
            {deleteTarget && (
                <ConfirmModal
                    title="Delete Article?"
                    message={`Delete "${deleteTarget.title}".`}
                    subMessage="This permanently removes the article and all its comments and likes. This cannot be undone."
                    confirmLabel="Delete Article"
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}

            <div className="admin-toolbar">
                <div className="admin-search">
                    <Search size={14} strokeWidth={2.25} />
                    <input
                        type="text"
                        placeholder="Search by title..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    />
                </div>
                {data && (
                    <span className="admin-toolbar-count">
                        {data.total} {data.total === 1 ? 'article' : 'articles'}
                    </span>
                )}
            </div>

            {error && <p className="admin-error">{error}</p>}

            {!data ? (
                <Spinner />
            ) : data.articles.length === 0 ? (
                <p className="admin-empty">No articles found.</p>
            ) : (
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Author</th>
                            <th>Category</th>
                            <th>Status</th>
                            <th>Views</th>
                            <th className="admin-table-actions-col">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.articles.map(article => {
                            const isPending = pendingId === article._id;
                            const ownerName = article._ownerId?.username || '—';
                            return (
                                <tr key={article._id}>
                                    <td>
                                        <div className="admin-article-title">
                                            {article.featured && (
                                                <Star size={12} strokeWidth={2.5} fill="currentColor" className="admin-featured-icon" />
                                            )}
                                            <span>{article.title}</span>
                                        </div>
                                    </td>
                                    <td>{ownerName}</td>
                                    <td>{article.category}</td>
                                    <td>
                                        <span className={`admin-status-badge admin-status-badge--${article.status}`}>
                                            {article.status}
                                        </span>
                                    </td>
                                    <td>{(article.views || 0).toLocaleString()}</td>
                                    <td>
                                        <div className="admin-row-actions">
                                            <Link
                                                to={`/articles/${article._id}/details`}
                                                className="admin-row-btn"
                                                title="View article"
                                            >
                                                <Eye size={14} strokeWidth={2.25} />
                                                View
                                            </Link>
                                            <button
                                                type="button"
                                                className={`admin-row-btn ${article.featured ? 'admin-row-btn--active' : ''}`}
                                                onClick={() => handleToggleFeatured(article)}
                                                disabled={isPending || article.status !== 'published'}
                                                title={article.status !== 'published' ? 'Only published articles can be featured' : (article.featured ? 'Unfeature' : 'Feature')}
                                            >
                                                <Star size={14} strokeWidth={2.25} fill={article.featured ? 'currentColor' : 'none'} />
                                                {article.featured ? 'Unfeature' : 'Feature'}
                                            </button>
                                            <button
                                                type="button"
                                                className="admin-row-btn admin-row-btn--danger"
                                                onClick={() => setDeleteTarget(article)}
                                                disabled={isPending}
                                            >
                                                <Trash2 size={14} strokeWidth={2.25} />
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
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
