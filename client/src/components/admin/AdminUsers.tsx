import { useState } from 'react';
import { Search, Trash2, ShieldCheck, ShieldOff, BadgeCheck, BadgeX } from 'lucide-react';
import { useAdminUsers } from '../../hooks/queries/useAdmin';
import { useUpdateUserRole, useUpdateUserTrust, useDeleteUser } from '../../hooks/mutations/useAdminMutations';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import type { AdminUserRow } from '../../services/adminService';
import { useAuth } from '../../contexts/AuthContext';
import ConfirmModal from '../common/ConfirmModal';
import Spinner from '../spinner/Spinner';
import { DEFAULT_AVATAR, handleAvatarError } from '../../utils/imageHelpers';

const PAGE_LIMIT = 20;

export default function AdminUsers() {
    const { userId: currentUserId } = useAuth();
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [actionError, setActionError] = useState('');
    const [deleteTarget, setDeleteTarget] = useState<AdminUserRow | null>(null);

    const debouncedSearch = useDebouncedValue(search);
    const { data, error: loadError } = useAdminUsers({ search: debouncedSearch, page, limit: PAGE_LIMIT });

    const updateRole = useUpdateUserRole();
    const updateTrust = useUpdateUserTrust();
    const removeUser = useDeleteUser();

    const error = actionError || loadError?.message || '';
    const pendingId = (updateRole.isPending && updateRole.variables?.userId)
        || (updateTrust.isPending && updateTrust.variables?.userId)
        || (removeUser.isPending && removeUser.variables)
        || null;

    const run = async (action: () => Promise<unknown>) => {
        setActionError('');
        try {
            await action();
        } catch (err) {
            setActionError(err instanceof Error ? err.message : 'Something went wrong');
        }
    };

    const handleToggleRole = (user: AdminUserRow) => {
        if (String(user._id) === String(currentUserId)) return;
        return run(() => updateRole.mutateAsync({
            userId: user._id,
            role: user.role === 'admin' ? 'user' : 'admin',
        }));
    };

    const handleToggleTrust = (user: AdminUserRow) =>
        run(() => updateTrust.mutateAsync({ userId: user._id, isTrusted: !user.isTrusted }));

    const handleDelete = async () => {
        if (!deleteTarget) return;
        await run(async () => {
            await removeUser.mutateAsync(deleteTarget._id);
            setDeleteTarget(null);
        });
    };

    return (
        <div className="admin-table-wrap">
            {deleteTarget && (
                <ConfirmModal
                    title="Delete User?"
                    message={`Delete "${deleteTarget.username}" (${deleteTarget.email}).`}
                    subMessage="This will also permanently delete all their articles, comments, bookmarks, likes, and glossary terms. This cannot be undone."
                    confirmLabel="Delete User"
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}

            <div className="admin-toolbar">
                <div className="admin-search">
                    <Search size={14} strokeWidth={2.25} />
                    <input
                        type="text"
                        placeholder="Search by username or email..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    />
                </div>
                {data && (
                    <span className="admin-toolbar-count">
                        {data.total} {data.total === 1 ? 'user' : 'users'}
                    </span>
                )}
            </div>

            {error && <p className="admin-error">{error}</p>}

            {!data ? (
                <Spinner />
            ) : data.users.length === 0 ? (
                <p className="admin-empty">No users found.</p>
            ) : (
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Publishing</th>
                            <th className="admin-table-actions-col">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.users.map(user => {
                            const isSelf = String(user._id) === String(currentUserId);
                            const isPending = pendingId === user._id;
                            const isAdmin = user.role === 'admin';
                            const publishesDirectly = isAdmin || Boolean(user.isTrusted);
                            return (
                                <tr key={user._id}>
                                    <td>
                                        <div className="admin-user-cell">
                                            <img
                                                src={user.profilePicture || DEFAULT_AVATAR}
                                                alt=""
                                                className="admin-user-avatar"
                                                onError={handleAvatarError}
                                            />
                                            <span>{user.username}{isSelf && <span className="admin-self-tag"> (you)</span>}</span>
                                        </div>
                                    </td>
                                    <td className="admin-table-mono">{user.email}</td>
                                    <td>
                                        <span className={`admin-role-badge admin-role-badge--${user.role}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="admin-trust-cell">
                                            <span className={`admin-trust-badge admin-trust-badge--${publishesDirectly ? 'direct' : 'review'}`}>
                                                {publishesDirectly ? 'Direct' : 'Review'}
                                            </span>
                                            {!publishesDirectly && (
                                                <span className="admin-trust-count">
                                                    {user.approvedArticles ?? 0} approved
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="admin-row-actions">
                                            <button
                                                type="button"
                                                className="admin-row-btn"
                                                onClick={() => handleToggleTrust(user)}
                                                disabled={isPending || isAdmin}
                                                title={isAdmin
                                                    ? 'Admins always publish without review'
                                                    : (user.isTrusted
                                                        ? 'Send this author\'s future submissions back to the review queue'
                                                        : 'Let this author publish without review')}
                                            >
                                                {user.isTrusted ? <BadgeX size={14} strokeWidth={2.25} /> : <BadgeCheck size={14} strokeWidth={2.25} />}
                                                {user.isTrusted ? 'Untrust' : 'Trust'}
                                            </button>
                                            <button
                                                type="button"
                                                className="admin-row-btn"
                                                onClick={() => handleToggleRole(user)}
                                                disabled={isSelf || isPending}
                                                title={isSelf ? 'You cannot change your own role' : (user.role === 'admin' ? 'Demote to user' : 'Promote to admin')}
                                            >
                                                {user.role === 'admin' ? <ShieldOff size={14} strokeWidth={2.25} /> : <ShieldCheck size={14} strokeWidth={2.25} />}
                                                {user.role === 'admin' ? 'Demote' : 'Promote'}
                                            </button>
                                            <button
                                                type="button"
                                                className="admin-row-btn admin-row-btn--danger"
                                                onClick={() => setDeleteTarget(user)}
                                                disabled={isSelf || isPending}
                                                title={isSelf ? 'You cannot delete your own account here' : 'Delete user and all their content'}
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
