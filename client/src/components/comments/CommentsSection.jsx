import { useState, useEffect } from "react";
import * as commentService from "../../services/commentService";
import { useAuth } from "../../contexts/AuthContext";
import ConfirmModal from "../common/ConfirmModal";

const defaultAvatar = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

function timeAgo(dateString) {
    const diff = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateString).toLocaleDateString();
}

export default function CommentsSection({ articleId, articleOwnerId }) {
    const { isAuthenticated, userId, profilePicture } = useAuth();

    const [comments, setComments] = useState([]);
    const [text, setText] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [deleteTarget, setDeleteTarget] = useState(null);

    useEffect(() => {
        commentService.getAllForArticle(articleId)
            .then(result => setComments(Array.isArray(result) ? result : []))
            .catch(() => setComments([]))
            .finally(() => setIsLoading(false));
    }, [articleId]);

    const onSubmit = async (e) => {
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
            setError(err.message || "Failed to post comment.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmDelete = async () => {
        try {
            await commentService.remove(deleteTarget);
            setComments(state => state.filter(c => c._id !== deleteTarget));
        } catch (err) {
            console.log("Delete failed:", err.message);
        } finally {
            setDeleteTarget(null);
        }
    };

    return (
        <div className="comments-section">
            {deleteTarget && (
                <ConfirmModal
                    icon="💬"
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
                        src={profilePicture || defaultAvatar}
                        alt="Your avatar"
                        className="comment-avatar"
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
                    <a href="/login">Log in</a> to join the discussion.
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
                                    src={comment.ownerProfilePicture || defaultAvatar}
                                    alt={comment.ownerUsername}
                                    className="comment-avatar"
                                />
                                <div className="comment-body">
                                    <div className="comment-meta">
                                        <span className="comment-author">{comment.ownerUsername}</span>
                                        {String(comment._ownerId) === String(articleOwnerId) && (
                                            <span className="comment-author-badge">Author</span>
                                        )}
                                        <span className="comment-time">{timeAgo(comment.createdAt)}</span>
                                        {userId && comment._ownerId === userId && (
                                            <button
                                                className="comment-delete-btn"
                                                onClick={() => setDeleteTarget(comment._id)}
                                                title="Delete comment"
                                            >
                                                ✕
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