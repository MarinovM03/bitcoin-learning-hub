import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import * as authService from "../../services/authService";

const USERNAME_COOLDOWN_DAYS = 30;

const getUsernameStatus = (usernameChangedAt) => {
    if (!usernameChangedAt) return { locked: false, daysLeft: 0 };
    const daysSince = (Date.now() - new Date(usernameChangedAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince >= USERNAME_COOLDOWN_DAYS) return { locked: false, daysLeft: 0 };
    return { locked: true, daysLeft: Math.ceil(USERNAME_COOLDOWN_DAYS - daysSince) };
};

const defaultAvatar = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

export default function ProfileForm({ onSaveSuccess }) {
    const { setAuth, usernameChangedAt } = useAuth();
    const [error, setError] = useState('');
    const [usernameWarningVisible, setUsernameWarningVisible] = useState(false);

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
        authService.getProfile().then(result => {
            setUser({
                username: result.username || '',
                email: result.email,
                profilePicture: result.profilePicture || '',
            });
        });
    }, []);

    const onProfileChange = (e) => {
        setUser(state => ({ ...state, [e.target.name]: e.target.value }));
        setError('');
    };

    const onPasswordChange = (e) => {
        setPasswords(state => ({ ...state, [e.target.name]: e.target.value }));
        setError('');
    };

    const onSubmit = async (e) => {
        e.preventDefault();
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
            const updatedUser = await authService.updateProfile({
                username: user.username,
                email: user.email,
                profilePicture: user.profilePicture,
                ...passwords,
            });

            const oldAuth = JSON.parse(localStorage.getItem('auth'));
            const newAuth = { ...oldAuth, ...updatedUser };
            localStorage.setItem('auth', JSON.stringify(newAuth));
            setAuth(newAuth);

            setPasswords({ password: '', confirmPassword: '' });
            onSaveSuccess();
        } catch (err) {
            setError(err.message || "Failed to update profile.");
        }
    };

    return (
        <div className="profile-card">
            <div className="profile-avatar-container">
                <img
                    src={user.profilePicture || defaultAvatar}
                    alt="Profile"
                    className="profile-avatar"
                />
            </div>

            <h1>Edit Profile</h1>
            <p className="profile-card-subtitle">Manage your account details</p>

            {error && <div className="profile-error-message">{error}</div>}

            <form className="register-form" onSubmit={onSubmit}>
                <p className="profile-section-label">Account Info</p>

                <div className="form-group">
                    <label>
                        Username
                        {usernameLocked && (
                            <span className="username-locked-badge">🔒 {daysLeft}d</span>
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
                            Locked for {daysLeft} more day{daysLeft === 1 ? '' : 's'}.
                        </p>
                    ) : usernameWarningVisible ? (
                        <p className="username-change-warning">
                            ⚠️ Changing locks username for <strong>30 days</strong>.
                        </p>
                    ) : null}
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

                <p className="profile-password-heading">Change Password</p>

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
                        placeholder="Repeat new password"
                    />
                </div>

                <input type="submit" value="Save Changes" className="btn-submit" />
            </form>
        </div>
    );
}