import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import * as authService from "../../services/authService";

export default function Profile() {
    const { setAuth } = useAuth();
    const [showSuccess, setShowSuccess] = useState(false);
    const [error, setError] = useState('');

    const defaultAvatar = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

    const [user, setUser] = useState({
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
        setShowSuccess(false);
        setError('');

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
                email: user.email,
                profilePicture: user.profilePicture,
                ...passwords,
            };

            const updatedUser = await authService.updateProfile(dataToUpdate);
            
            const oldAuth = JSON.parse(localStorage.getItem('auth'));
            const newAuth = { ...oldAuth, ...updatedUser };
            
            localStorage.setItem('auth', JSON.stringify(newAuth));
            setAuth(newAuth);

            setShowSuccess(true);
            setPasswords({ password: '', confirmPassword: '' });
            
            setTimeout(() => {
                setShowSuccess(false);
            }, 3000);

        } catch (err) {
            console.error(err);
            setError(err.message || "Failed to update profile.");
        }
    };

    return (
        <section id="profile-page" className="page-content">
            <div className="register-page">
                <h1>Edit Profile</h1>
                
                <div className="profile-avatar-container">
                    <img 
                        src={user.profilePicture || defaultAvatar} 
                        alt="Profile" 
                        className="profile-avatar" 
                    />
                </div>

                {showSuccess && (
                    <div className="profile-success-message">
                        ✅ Profile updated successfully!
                    </div>
                )}

                {error && (
                    <div style={{ color: 'red', textAlign: 'center', marginBottom: '15px', fontWeight: 'bold' }}>
                        {error}
                    </div>
                )}

                <form className="register-form" onSubmit={onSubmit}>
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
        </section>
    );
}