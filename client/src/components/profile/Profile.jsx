import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import * as authService from "../../services/authService";

export default function Profile() {
    const { setAuth } = useAuth();
    const [showSuccess, setShowSuccess] = useState(false);
    
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
    };

    const onPasswordChange = (e) => {
        setPasswords(state => ({ ...state, [e.target.name]: e.target.value }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setShowSuccess(false);

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
            setTimeout(() => {
                setShowSuccess(false);
            }, 3000);

        } catch (err) {
            console.error(err);
            alert(err.message || "Failed to update profile.");
        }
    };

    return (
        <section id="profile-page" className="page-content">
            <div className="register-page">
                <h1>Edit Profile</h1>
                
                <div className="profile-avatar-container">
                    {user.profilePicture ? (
                        <img 
                            src={user.profilePicture} 
                            alt="Profile" 
                            className="profile-avatar" 
                        />
                    ) : (
                        <div className="profile-avatar-placeholder"></div>
                    )}
                </div>

                {showSuccess && (
                    <div className="profile-success-message">
                        ✅ Profile updated successfully!
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