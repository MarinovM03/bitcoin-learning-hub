import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Lock, AlertCircle, KeyRound, Trash2 } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import * as authService from "../../services/authService";
import { updateProfileSchema } from "../../validators/authSchemas";
import PasswordField from "../common/PasswordField";
import ChangePasswordModal from "../change-password-modal/ChangePasswordModal";
import DeleteAccountModal from "../delete-account-modal/DeleteAccountModal";
import { DEFAULT_AVATAR, handleAvatarError } from '../../utils/imageHelpers';

const USERNAME_COOLDOWN_DAYS = 30;

const getUsernameStatus = (usernameChangedAt: string | null) => {
    if (!usernameChangedAt) return { locked: false, daysLeft: 0 };
    const daysSince = (Date.now() - new Date(usernameChangedAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince >= USERNAME_COOLDOWN_DAYS) return { locked: false, daysLeft: 0 };
    return { locked: true, daysLeft: Math.ceil(USERNAME_COOLDOWN_DAYS - daysSince) };
};

type ProfileValues = z.infer<typeof updateProfileSchema>;

interface ProfileFormProps {
    onSaveSuccess: () => void;
}

export default function ProfileForm({ onSaveSuccess }: ProfileFormProps) {
    const { updateAuthState, usernameChangedAt } = useAuth();
    const [serverError, setServerError] = useState('');
    const [usernameWarningVisible, setUsernameWarningVisible] = useState(false);
    const [initialEmail, setInitialEmail] = useState('');
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const { locked: usernameLocked, daysLeft } = getUsernameStatus(usernameChangedAt);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<ProfileValues>({
        resolver: zodResolver(updateProfileSchema),
        defaultValues: {
            username: '',
            email: '',
            profilePicture: '',
            currentPassword: '',
        },
    });

    const profilePictureValue = watch('profilePicture');
    const emailValue = watch('email');
    const needsCurrentPassword =
        Boolean(initialEmail) && (emailValue || '').trim().toLowerCase() !== initialEmail;

    useEffect(() => {
        authService.getProfile().then(result => {
            setInitialEmail((result.email || '').toLowerCase());
            reset({
                username: result.username || '',
                email: result.email || '',
                profilePicture: result.profilePicture || '',
                currentPassword: '',
            });
        });
    }, [reset]);

    const onSubmit = async (values: ProfileValues) => {
        setServerError('');

        if (needsCurrentPassword && !values.currentPassword) {
            setServerError("Enter your current password to change your email.");
            return;
        }

        const payload: authService.ProfileUpdateData = {
            username: values.username,
            email: values.email,
            profilePicture: values.profilePicture,
        };
        if (values.currentPassword) {
            payload.currentPassword = values.currentPassword;
        }

        try {
            const updatedUser = await authService.updateProfile(payload);
            updateAuthState(updatedUser);
            setInitialEmail((updatedUser.email || '').toLowerCase());
            reset({
                username: updatedUser.username || '',
                email: updatedUser.email || '',
                profilePicture: updatedUser.profilePicture || '',
                currentPassword: '',
            });
            onSaveSuccess();
        } catch (err) {
            setServerError(err instanceof Error ? err.message : "Failed to update profile.");
        }
    };

    return (
        <div className="profile-card">
            <div className="profile-avatar-container">
                <img
                    src={profilePictureValue || DEFAULT_AVATAR}
                    alt="Profile"
                    className="profile-avatar"
                    onError={handleAvatarError}
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

                {needsCurrentPassword && (
                    <>
                        <p className="profile-password-heading">Confirm It's You</p>
                        <PasswordField
                            id="profile-current-password"
                            label="Current Password"
                            placeholder="Required to change email"
                            autoComplete="current-password"
                            error={errors.currentPassword?.message}
                            {...register('currentPassword')}
                        />
                    </>
                )}

                <input
                    type="submit"
                    value={isSubmitting ? "Saving..." : "Save Changes"}
                    className="btn-submit"
                    disabled={isSubmitting}
                />

                <p className="profile-password-heading">Security</p>
                <button
                    type="button"
                    className="profile-security-btn"
                    onClick={() => setIsPasswordModalOpen(true)}
                >
                    <KeyRound size={15} strokeWidth={2.25} />
                    Change Password…
                </button>

                <p className="profile-password-heading profile-danger-heading">Danger Zone</p>
                <button
                    type="button"
                    className="profile-security-btn profile-danger-btn"
                    onClick={() => setIsDeleteModalOpen(true)}
                >
                    <Trash2 size={15} strokeWidth={2.25} />
                    Delete Account…
                </button>
            </form>

            {isPasswordModalOpen && (
                <ChangePasswordModal onClose={() => setIsPasswordModalOpen(false)} />
            )}
            {isDeleteModalOpen && (
                <DeleteAccountModal onClose={() => setIsDeleteModalOpen(false)} />
            )}
        </div>
    );
}
