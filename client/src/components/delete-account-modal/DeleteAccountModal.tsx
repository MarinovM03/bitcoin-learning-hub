import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { TriangleAlert, X } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import * as authService from "../../services/authService";
import PasswordField from "../common/PasswordField";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import { useBackdropClose } from "../../hooks/useBackdropClose";
import { toast } from "../../lib/toast";

const schema = z.object({
    password: z.string().min(1, 'Enter your password to delete your account.'),
});

type DeleteAccountValues = z.infer<typeof schema>;

interface DeleteAccountModalProps {
    onClose: () => void;
}

export default function DeleteAccountModal({ onClose }: DeleteAccountModalProps) {
    const { logoutHandler } = useAuth();
    const [serverError, setServerError] = useState('');
    const trapRef = useFocusTrap<HTMLDivElement>(true, onClose);
    const backdropHandlers = useBackdropClose(onClose);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<DeleteAccountValues>({
        resolver: zodResolver(schema),
        defaultValues: { password: '' },
    });

    const onSubmit = async ({ password }: DeleteAccountValues) => {
        setServerError('');
        try {
            await authService.deleteAccount(password);
            toast.success('Your account has been deleted. Take care!');
            await logoutHandler();
        } catch (err) {
            setServerError(err instanceof Error ? err.message : 'Failed to delete the account.');
        }
    };

    return (
        <div className="modal-overlay" {...backdropHandlers}>
            <div
                className="cpm-box dam-box"
                onClick={(e) => e.stopPropagation()}
                ref={trapRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="delete-account-title"
            >
                <button type="button" className="cpm-close" onClick={onClose} aria-label="Close">
                    <X size={18} strokeWidth={2.25} />
                </button>
                <div className="cpm-icon dam-icon">
                    <TriangleAlert size={24} strokeWidth={1.8} />
                </div>
                <h3 className="cpm-title" id="delete-account-title">Delete Account?</h3>
                <p className="cpm-hint">
                    This permanently removes your account together with every article, path,
                    comment, like, bookmark, and certification you have. It cannot be undone.
                </p>

                <form className="cpm-form" onSubmit={handleSubmit(onSubmit)} noValidate>
                    <PasswordField
                        id="dam-password"
                        label="Password"
                        placeholder="Confirm with your password"
                        autoComplete="current-password"
                        error={errors.password?.message}
                        {...register('password')}
                    />

                    {serverError && <p className="field-error">{serverError}</p>}

                    <div className="cpm-actions">
                        <button type="button" className="modal-btn modal-btn--cancel" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="modal-btn modal-btn--confirm" disabled={isSubmitting}>
                            {isSubmitting ? 'Deleting...' : 'Delete'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
