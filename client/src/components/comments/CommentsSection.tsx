import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router";
import { X, PenLine } from "lucide-react";
import * as commentService from "../../services/commentService";
import { useAuth } from "../../contexts/AuthContext";
import ConfirmModal from "../common/ConfirmModal";
import { toast } from "../../lib/toast";
import type { Comment } from "../../types";
import { DEFAULT_AVATAR, handleAvatarError } from '../../utils/imageHelpers';
import { timeAgo } from '../../utils/formatters';

const EDIT_WINDOW_MS = 5 * 60 * 1000;
const EDITED_EPSILON_MS = 1000;

const isWithinEditWindow = (comment: Comment) =>
    Date.now() - new Date(comment.createdAt).getTime() < EDIT_WINDOW_MS;

const wasEdited = (comment: Comment) =>
    new Date(comment.updatedAt).getTime() - new Date(comment.createdAt).getTime() > EDITED_EPSILON_MS;

interface CommentsSectionProps {
    articleId: string;
    articleOwnerId?: string;
}

export default function CommentsSection({ articleId, articleOwnerId }: CommentsSectionProps) {
    const { isAuthenticated, userId, profilePicture } = useAuth();

    const [comments, setComments] = useState<Comment[]>([]);
    const [text, setText] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editText, setEditText] = useState("");
    const [isSavingEdit, setIsSavingEdit] = useState(false);

    useEffect(() => {
        commentService.getAllForArticle(articleId)
            .then(result => setComments(Array.isArray(result) ? result : []))
            .catch(() => setComments([]))
            .finally(() => setIsLoading(false));
    }, [articleId]);

    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (text.trim().length < 2) {
            setError("Comment must be at least 2 characters.");
            return;
        }
        setIsSubmitting(true);
        try {
            const newComment = await commentService.create(articleId, text.trim());
            setComments(state => [newComment, ...state]);
            setText("");
            setError("");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to post comment.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const startEditing = (comment: Comment) => {
        setEditingId(comment._id);
        setEditText(comment.text);
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditText("");
    };

    const saveEdit = async () => {
        if (!editingId || editText.trim().length < 2 || isSavingEdit) return;
        setIsSavingEdit(true);
        try {
            const updated = await commentService.update(editingId, editText.trim());
            setComments(state => state.map(c => (c._id === editingId ? updated : c)));
            cancelEditing();
            toast.success('Comment updated.');
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Couldn't update the comment. Try again.");
        } finally {
            setIsSavingEdit(false);
        }
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            await commentService.remove(deleteTarget);
            setComments(state => state.filter(c => c._id !== deleteTarget));
            toast.success('Comment deleted.');
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Couldn't delete the comment. Try again.");
        } finally {
            setDeleteTarget(null);
        }
    };

    return (
        <div className="comments-section">
            {deleteTarget && (
                <ConfirmModal
                    title="Delete Comment?"
                    message="You are about to delete your comment."
                    subMessage="This action cannot be undone."
                    confirmLabel="Delete Comment"
                    onConfirm={confirmDelete}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}

            <h3 className="comments-heading">
                Discussion <span className="comments-count">({comments.length})</span>
            </h3>

            {isAuthenticated ? (
                <form className="comment-form" onSubmit={onSubmit}>
                    <img
                        src={profilePicture || DEFAULT_AVATAR}
                        alt="Your avatar"
                        className="comment-avatar"
                        onError={handleAvatarError}
                    />
                    <div className="comment-input-wrapper">
                        <textarea
                            className="comment-textarea"
                            placeholder="Share your thoughts..."
                            value={text}
                            onChange={(e) => { setText(e.target.value); setError(""); }}
                            rows={3}
                            maxLength={500}
                        />
                        <div className="comment-form-footer">
                            {error && <span className="comment-error">{error}</span>}
                            <span className="comment-char-count">{text.length}/500</span>
                            <button
                                type="submit"
                                className="comment-submit-btn"
                                disabled={isSubmitting || text.trim().length < 2}
                            >
                                {isSubmitting ? "Posting..." : "Post Comment"}
                            </button>
                        </div>
                    </div>
                </form>
            ) : (
                <p className="comments-login-prompt">
                    <Link to="/login">Log in</Link> to join the discussion.
                </p>
            )}

            {isLoading ? (
                <p className="comments-empty">Loading comments...</p>
            ) : (
                <div className="comments-list">
                    {comments.length === 0 ? (
                        <p className="comments-empty">No comments yet. Be the first to start the discussion!</p>
                    ) : (
                        comments.map(comment => (
                            <div key={comment._id} className="comment-card">
                                <img
                                    src={comment._ownerId?.profilePicture || DEFAULT_AVATAR}
                                    alt={comment._ownerId?.username}
                                    className="comment-avatar"
                                    onError={handleAvatarError}
                                />
                                <div className="comment-body">
                                    <div className="comment-meta">
                                        {comment._ownerId?._id ? (
                                            <Link to={`/users/${comment._ownerId._id}`} className="comment-author">
                                                {comment._ownerId.username}
                                            </Link>
                                        ) : (
                                            <span className="comment-author">{comment._ownerId?.username}</span>
                                        )}
                                        {String(comment._ownerId?._id) === String(articleOwnerId) && (
                                            <span className="comment-author-badge">Author</span>
                                        )}
                                        <span className="comment-time">{timeAgo(comment.createdAt)}</span>
                                        {wasEdited(comment) && (
                                            <span className="comment-edited-tag">(edited)</span>
                                        )}
                                        {userId && String(comment._ownerId?._id) === String(userId) && (
                                            <>
                                                {isWithinEditWindow(comment) && editingId !== comment._id && (
                                                    <button
                                                        className="comment-edit-btn"
                                                        onClick={() => startEditing(comment)}
                                                        aria-label="Edit comment"
                                                    >
                                                        <PenLine size={13} strokeWidth={2.25} />
                                                    </button>
                                                )}
                                                <button
                                                    className="comment-delete-btn"
                                                    onClick={() => setDeleteTarget(comment._id)}
                                                    aria-label="Delete comment"
                                                >
                                                    <X size={14} strokeWidth={2.25} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                    {editingId === comment._id ? (
                                        <div className="comment-edit-form">
                                            <textarea
                                                className="comment-textarea"
                                                value={editText}
                                                onChange={(e) => setEditText(e.target.value)}
                                                rows={3}
                                                maxLength={500}
                                            />
                                            <div className="comment-edit-actions">
                                                <span className="comment-char-count">{editText.length}/500</span>
                                                <button
                                                    type="button"
                                                    className="comment-edit-cancel"
                                                    onClick={cancelEditing}
                                                    disabled={isSavingEdit}
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="button"
                                                    className="comment-submit-btn"
                                                    onClick={saveEdit}
                                                    disabled={isSavingEdit || editText.trim().length < 2}
                                                >
                                                    {isSavingEdit ? 'Saving...' : 'Save'}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="comment-text">{comment.text}</p>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}