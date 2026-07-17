import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router";
import { X } from "lucide-react";
import * as commentService from "../../services/commentService";
import { useAuth } from "../../contexts/AuthContext";
import ConfirmModal from "../common/ConfirmModal";
import { toast } from "../../lib/toast";
import type { Comment } from "../../types";
import { DEFAULT_AVATAR, handleAvatarError } from '../../utils/imageHelpers';
import { timeAgo } from '../../utils/formatters';

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
                                        {userId && String(comment._ownerId?._id) === String(userId) && (
                                            <button
                                                className="comment-delete-btn"
                                                onClick={() => setDeleteTarget(comment._id)}
                                                aria-label="Delete comment"
                                            >
                                                <X size={14} strokeWidth={2.25} />
                                            </button>
                                        )}
                                    </div>
                                    <p className="comment-text">{comment.text}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}