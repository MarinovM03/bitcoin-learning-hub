import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { KeyRound, X } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import * as authService from "../../services/authService";
import PasswordField from "../common/PasswordField";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import { useBackdropClose } from "../../hooks/useBackdropClose";
import { toast } from "../../lib/toast";

const schema = z.object({
    currentPassword: z.string().min(1, 'Enter your current password'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters long!')
        .max(128, 'Password must be at most 128 characters'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match!',
    path: ['confirmPassword'],
}).refine((data) => data.password !== data.currentPassword, {
    message: 'New password must be different from your current password.',
    path: ['password'],
});

type ChangePasswordValues = z.infer<typeof schema>;

interface ChangePasswordModalProps {
    onClose: () => void;
}

export default function ChangePasswordModal({ onClose }: ChangePasswordModalProps) {
    const { updateAuthState } = useAuth();
    const [serverError, setServerError] = useState('');
    const trapRef = useFocusTrap<HTMLDivElement>(true, onClose);
    const backdropHandlers = useBackdropClose(onClose);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ChangePasswordValues>({
        resolver: zodResolver(schema),
        defaultValues: { currentPassword: '', password: '', confirmPassword: '' },
    });

    const onSubmit = async (values: ChangePasswordValues) => {
        setServerError('');
        try {
            const updatedUser = await authService.updateProfile({
                password: values.password,
                confirmPassword: values.confirmPassword,
                currentPassword: values.currentPassword,
            });
            updateAuthState(updatedUser);
            toast.success('Password updated. Other devices have been signed out.');
            onClose();
        } catch (err) {
            setServerError(err instanceof Error ? err.message : 'Failed to update the password.');
        }
    };

    return (
        <div className="modal-overlay" {...backdropHandlers}>
            <div
                className="cpm-box"
                onClick={(e) => e.stopPropagation()}
                ref={trapRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="change-password-title"
            >
                <button type="button" className="cpm-close" onClick={onClose} aria-label="Close">
                    <X size={18} strokeWidth={2.25} />
                </button>
                <div className="cpm-icon">
                    <KeyRound size={24} strokeWidth={1.8} />
                </div>
                <h3 className="cpm-title" id="change-password-title">Change Password</h3>
                <p className="cpm-hint">
                    You'll stay signed in here — other devices are signed out.
                </p>

                <form className="cpm-form" onSubmit={handleSubmit(onSubmit)} noValidate>
                    <PasswordField
                        id="cpm-current-password"
                        label="Current Password"
                        placeholder="Your current password"
                        autoComplete="current-password"
                        error={errors.currentPassword?.message}
                        {...register('currentPassword')}
                    />

                    <PasswordField
                        id="cpm-new-password"
                        label="New Password"
                        placeholder="At least 8 characters"
                        autoComplete="new-password"
                        error={errors.password?.message}
                        {...register('password')}
                    />

                    <PasswordField
                        id="cpm-confirm-password"
                        label="Confirm New Password"
                        placeholder="Repeat new password"
                        autoComplete="new-password"
                        error={errors.confirmPassword?.message}
                        {...register('confirmPassword')}
                    />

                    {serverError && <p className="field-error">{serverError}</p>}

                    <div className="cpm-actions">
                        <button type="button" className="modal-btn modal-btn--cancel" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="modal-btn cpm-btn-save" disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
