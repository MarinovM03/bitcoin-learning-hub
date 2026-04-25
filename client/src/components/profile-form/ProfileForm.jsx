import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, AlertCircle } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import * as authService from "../../services/authService";
import { updateProfileSchema } from "../../validators/authSchemas";

const USERNAME_COOLDOWN_DAYS = 30;

const getUsernameStatus = (usernameChangedAt) => {
    if (!usernameChangedAt) return { locked: false, daysLeft: 0 };
    const daysSince = (Date.now() - new Date(usernameChangedAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince >= USERNAME_COOLDOWN_DAYS) return { locked: false, daysLeft: 0 };
    return { locked: true, daysLeft: Math.ceil(USERNAME_COOLDOWN_DAYS - daysSince) };
};

const defaultAvatar = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

export default function ProfileForm({ onSaveSuccess }) {
    const { updateAuthState, usernameChangedAt } = useAuth();
    const [serverError, setServerError] = useState('');
    const [usernameWarningVisible, setUsernameWarningVisible] = useState(false);

    const { locked: usernameLocked, daysLeft } = getUsernameStatus(usernameChangedAt);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(updateProfileSchema),
        defaultValues: {
            username: '',
            email: '',
            profilePicture: '',
            password: '',
            confirmPassword: '',
        },
    });

    const profilePictureValue = watch('profilePicture');

    useEffect(() => {
        authService.getProfile().then(result => {
            reset({
                username: result.username || '',
                email: result.email || '',
                profilePicture: result.profilePicture || '',
                password: '',
                confirmPassword: '',
            });
        });
    }, [reset]);

    const onSubmit = async (values) => {
        setServerError('');

        if (values.password && !values.confirmPassword) {
            setServerError("Please re-enter your new password in the confirmation field.");
            return;
        }
        if (!values.password && values.confirmPassword) {
            setServerError("Please enter a value for the New Password field.");
            return;
        }

        try {
            const updatedUser = await authService.updateProfile(values);
            updateAuthState(updatedUser);
            reset({
                username: updatedUser.username || '',
                email: updatedUser.email || '',
                profilePicture: updatedUser.profilePicture || '',
                password: '',
                confirmPassword: '',
            });
            onSaveSuccess();
        } catch (err) {
            setServerError(err.message || "Failed to update profile.");
        }
    };

    return (
        <div className="profile-card">
            <div className="profile-avatar-container">
                <img
                    src={profilePictureValue || defaultAvatar}
                    alt="Profile"
                    className="profile-avatar"
                />
            </div>

            <h1>Edit Profile</h1>
            <p className="profile-card-subtitle">Manage your account details</p>

            {serverError && <div className="profile-error-message">{serverError}</div>}

            <form className="register-form" onSubmit={handleSubmit(onSubmit)} noValidate>
                <p className="profile-section-label">Account Info</p>

                <div className="form-group">
                    <label>
                        Username
                        {usernameLocked && (
                            <span className="username-locked-badge">
                                <Lock size={12} strokeWidth={2.5} />
                                {daysLeft}d
                            </span>
                        )}
                    </label>
                    <input
                        type="text"
                        placeholder="e.g. SatoshiNakamoto"
                        disabled={usernameLocked}
                        className={usernameLocked ? 'input-locked' : ''}
                        {...register('username', {
                            onBlur: () => setUsernameWarningVisible(false),
                        })}
                        onFocus={() => !usernameLocked && setUsernameWarningVisible(true)}
                    />
                    {errors.username && <p className="field-error">{errors.username.message}</p>}
                    {usernameLocked ? (
                        <p className="username-locked-hint">
                            Locked for {daysLeft} more day{daysLeft === 1 ? '' : 's'}.
                        </p>
                    ) : usernameWarningVisible ? (
                        <p className="username-change-warning">
                            <AlertCircle size={14} strokeWidth={2.25} />
                            Changing locks username for <strong>30 days</strong>.
                        </p>
                    ) : null}
                </div>

                <div className="form-group">
                    <label>Email</label>
                    <input type="email" {...register('email')} />
                    {errors.email && <p className="field-error">{errors.email.message}</p>}
                </div>

                <div className="form-group">
                    <label>Profile Picture URL</label>
                    <input
                        type="text"
                        placeholder="https://..."
                        {...register('profilePicture')}
                    />
                    {errors.profilePicture && <p className="field-error">{errors.profilePicture.message}</p>}
                </div>

                <p className="profile-password-heading">Change Password</p>

                <div className="form-group">
                    <label>New Password</label>
                    <input
                        type="password"
                        placeholder="Leave blank to keep current"
                        {...register('password')}
                    />
                    {errors.password && <p className="field-error">{errors.password.message}</p>}
                </div>

                <div className="form-group">
                    <label>Confirm New Password</label>
                    <input
                        type="password"
                        placeholder="Repeat new password"
                        {...register('confirmPassword')}
                    />
                    {errors.confirmPassword && <p className="field-error">{errors.confirmPassword.message}</p>}
                </div>

                <input
                    type="submit"
                    value={isSubmitting ? "Saving..." : "Save Changes"}
                    className="btn-submit"
                    disabled={isSubmitting}
                />
            </form>
        </div>
    );
}
