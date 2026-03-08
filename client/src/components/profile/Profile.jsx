import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import * as authService from "../../services/authService";
import * as articleService from "../../services/articleService";
import Spinner from "../spinner/Spinner";
import ConfirmModal from "../common/ConfirmModal";

const USERNAME_COOLDOWN_DAYS = 30;

const getUsernameStatus = (usernameChangedAt) => {
    if (!usernameChangedAt) return { locked: false, daysLeft: 0 };
    const daysSince = (Date.now() - new Date(usernameChangedAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince >= USERNAME_COOLDOWN_DAYS) return { locked: false, daysLeft: 0 };
    return { locked: true, daysLeft: Math.ceil(USERNAME_COOLDOWN_DAYS - daysSince) };
};

export default function Profile() {
    const { setAuth, usernameChangedAt } = useAuth();
    const [showToast, setShowToast] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [myArticles, setMyArticles] = useState([]);
    const [articlesLoading, setArticlesLoading] = useState(true);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [usernameWarningVisible, setUsernameWarningVisible] = useState(false);

    const defaultAvatar = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

    const { locked: usernameLocked, daysLeft } = getUsernameStatus(usernameChangedAt);

    const [user, setUser] = useState({
        username: '',
        email: '',
        profilePicture: '',
    });

    const [passwords, setPasswords] = useState({
        password: '',
        confirmPassword: '',
    });

    useEffect(() => {
        authService.getProfile()
            .then(result => {
                setUser({
                    username: result.username || '',
                    email: result.email,
                    profilePicture: result.profilePicture || '',
                });
            })
            .finally(() => setIsLoading(false));

        articleService.getMyArticles()
            .then(result => setMyArticles(result))
            .catch(err => console.log("Failed to load articles:", err.message))
            .finally(() => setArticlesLoading(false));
    }, []);

    const onProfileChange = (e) => {
        setUser(state => ({ ...state, [e.target.name]: e.target.value }));
        setError('');
    };

    const onPasswordChange = (e) => {
        setPasswords(state => ({ ...state, [e.target.name]: e.target.value }));
        setError('');
    };

    const triggerToast = () => {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setShowToast(false);
        setError('');

        if (user.username.trim().length < 3) {
            setError("Username must be at least 3 characters long!");
            return;
        }
        if (!/^[a-zA-Z0-9]+$/.test(user.username)) {
            setError("Username can only contain letters and numbers!");
            return;
        }
        if (passwords.password && !passwords.confirmPassword) {
            setError("Please re-enter your new password in the confirmation field.");
            return;
        }
        if (!passwords.password && passwords.confirmPassword) {
            setError("Please enter a value for the New Password field.");
            return;
        }
        if (passwords.password) {
            if (passwords.password.length < 4) {
                setError("Password must be at least 4 characters long!");
                return;
            }
            if (passwords.password !== passwords.confirmPassword) {
                setError("Passwords do not match!");
                return;
            }
        }

        try {
            const dataToUpdate = {
                username: user.username,
                email: user.email,
                profilePicture: user.profilePicture,
                ...passwords,
            };

            const updatedUser = await authService.updateProfile(dataToUpdate);
            const oldAuth = JSON.parse(localStorage.getItem('auth'));
            const newAuth = { ...oldAuth, ...updatedUser };
            localStorage.setItem('auth', JSON.stringify(newAuth));
            setAuth(newAuth);

            setPasswords({ password: '', confirmPassword: '' });
            triggerToast();

        } catch (err) {
            console.error(err);
            setError(err.message || "Failed to update profile.");
        }
    };

    const confirmDeleteArticle = async () => {
        try {
            await articleService.remove(deleteTarget.id);
            setMyArticles(prev => prev.filter(a => a._id !== deleteTarget.id));
        } catch (err) {
            console.log("Delete failed:", err.message);
        } finally {
            setDeleteTarget(null);
        }
    };

    if (isLoading) {
        return <Spinner />;
    }

    return (
        <section id="profile-page" className="page-content">
            {showToast && (
                <div className="profile-toast">
                    ✅ Profile updated successfully!
                </div>
            )}

            {deleteTarget && (
                <ConfirmModal
                    icon="📄"
                    title="Delete Article?"
                    message={`You are about to delete "${deleteTarget.title}".`}
                    subMessage="This will permanently remove the article and cannot be undone."
                    confirmLabel="Delete Article"
                    onConfirm={confirmDeleteArticle}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}

            <div className="register-page">
                <h1>Edit Profile</h1>

                <div className="profile-avatar-container">
                    <img
                        src={user.profilePicture || defaultAvatar}
                        alt="Profile"
                        className="profile-avatar"
                    />
                </div>

                {error && (
                    <div className="profile-error-message">{error}</div>
                )}

                <form className="register-form" onSubmit={onSubmit}>
                    <div className="form-group">
                        <label>
                            Username
                            {usernameLocked && (
                                <span className="username-locked-badge">🔒 {daysLeft}d remaining</span>
                            )}
                        </label>
                        <input
                            type="text"
                            name="username"
                            value={user.username}
                            onChange={onProfileChange}
                            placeholder="e.g. SatoshiNakamoto"
                            disabled={usernameLocked}
                            className={usernameLocked ? 'input-locked' : ''}
                            onFocus={() => !usernameLocked && setUsernameWarningVisible(true)}
                            onBlur={() => setUsernameWarningVisible(false)}
                        />
                        {usernameLocked ? (
                            <p className="username-locked-hint">
                                Your username is locked for {daysLeft} more day{daysLeft === 1 ? '' : 's'}.
                            </p>
                        ) : usernameWarningVisible ? (
                            <p className="username-change-warning">
                                ⚠️ Changing your username will lock it for <strong>30 days</strong>. Your current username will become available for others to claim.
                            </p>
                        ) : null}
                    </div>

                    <div className="form-group">
                        <label>Profile Picture URL</label>
                        <input
                            type="text"
                            name="profilePicture"
                            value={user.profilePicture}
                            onChange={onProfileChange}
                            placeholder="https://..."
                        />
                    </div>

                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={user.email}
                            onChange={onProfileChange}
                        />
                    </div>

                    <h3 className="profile-password-heading">Change Password (Optional)</h3>

                    <div className="form-group">
                        <label>New Password</label>
                        <input
                            type="password"
                            name="password"
                            value={passwords.password}
                            onChange={onPasswordChange}
                            placeholder="Leave blank to keep current"
                        />
                    </div>

                    <div className="form-group">
                        <label>Confirm New Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={passwords.confirmPassword}
                            onChange={onPasswordChange}
                        />
                    </div>

                    <input type="submit" value="Save Changes" className="btn-submit" />
                </form>
            </div>

            <div className="my-articles-section">
                <div className="my-articles-header">
                    <h2>My Articles</h2>
                    <span className="my-articles-count">
                        {myArticles.length} {myArticles.length === 1 ? 'article' : 'articles'}
                    </span>
                </div>

                {articlesLoading ? (
                    <Spinner />
                ) : myArticles.length === 0 ? (
                    <div className="my-articles-empty">
                        <p>You haven't published any articles yet.</p>
                        <Link to="/articles/create" className="btn-submit my-articles-cta">
                            Write Your First Article
                        </Link>
                    </div>
                ) : (
                    <div className="my-articles-list">
                        {myArticles.map(article => (
                            <div key={article._id} className="my-article-card">
                                <img
                                    src={article.imageUrl}
                                    alt={article.title}
                                    className="my-article-card-img"
                                />
                                <div className="my-article-card-body">
                                    <span className="my-article-category">{article.category}</span>
                                    <h3 className="my-article-title">{article.title}</h3>
                                    <p className="my-article-summary">{article.summary}</p>
                                </div>
                                <div className="my-article-card-actions">
                                    <Link
                                        to={`/articles/${article._id}/details`}
                                        className="my-article-btn my-article-btn--view"
                                    >
                                        View
                                    </Link>
                                    <Link
                                        to={`/articles/${article._id}/edit`}
                                        className="my-article-btn my-article-btn--edit"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        className="my-article-btn my-article-btn--delete"
                                        onClick={() => setDeleteTarget({ id: article._id, title: article.title })}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}