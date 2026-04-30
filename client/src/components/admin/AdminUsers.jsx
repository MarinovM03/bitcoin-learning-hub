import { useEffect, useState } from 'react';
import { Search, Trash2, ShieldCheck, ShieldOff } from 'lucide-react';
import * as adminService from '../../services/adminService';
import { useAuth } from '../../contexts/AuthContext';
import ConfirmModal from '../common/ConfirmModal';
import Spinner from '../spinner/Spinner';

const PAGE_LIMIT = 20;

const defaultAvatar = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

export default function AdminUsers() {
    const { userId: currentUserId } = useAuth();
    const [data, setData] = useState(null);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [pendingId, setPendingId] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const reload = () => {
        setError('');
        adminService.getUsers({ search, page, limit: PAGE_LIMIT })
            .then(setData)
            .catch(err => setError(err.message));
    };

    useEffect(() => {
        const timer = setTimeout(reload, 250);
        return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, page]);

    const handleToggleRole = async (user) => {
        if (String(user._id) === String(currentUserId)) return;
        setPendingId(user._id);
        try {
            const newRole = user.role === 'admin' ? 'user' : 'admin';
            await adminService.updateUserRole(user._id, newRole);
            reload();
        } catch (err) {
            setError(err.message);
        } finally {
            setPendingId(null);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setPendingId(deleteTarget._id);
        try {
            await adminService.deleteUser(deleteTarget._id);
            setDeleteTarget(null);
            reload();
        } catch (err) {
            setError(err.message);
        } finally {
            setPendingId(null);
        }
    };

    return (
        <div className="admin-table-wrap">
            {deleteTarget && (
                <ConfirmModal
                    title="Delete User?"
                    message={`Delete "${deleteTarget.username}" (${deleteTarget.email}).`}
                    subMessage="This will also permanently delete all their articles, paths, comments, bookmarks, likes, and glossary terms. This cannot be undone."
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
                            <th className="admin-table-actions-col">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.users.map(user => {
                            const isSelf = String(user._id) === String(currentUserId);
                            const isPending = pendingId === user._id;
                            return (
                                <tr key={user._id}>
                                    <td>
                                        <div className="admin-user-cell">
                                            <img
                                                src={user.profilePicture || defaultAvatar}
                                                alt=""
                                                className="admin-user-avatar"
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
                                        <div className="admin-row-actions">
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
