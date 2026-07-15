import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useSearchParams } from "react-router";
import { z } from "zod";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import PageMeta from "../page-meta/PageMeta";
import PasswordField from "../common/PasswordField";
import * as authService from "../../services/authService";

const schema = z.object({
    password: z.string().min(8, 'Password must be at least 8 characters long!'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match!',
    path: ['confirmPassword'],
});

type ResetPasswordValues = z.infer<typeof schema>;

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token') ?? '';
    const [serverError, setServerError] = useState('');
    const [isDone, setIsDone] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ResetPasswordValues>({
        resolver: zodResolver(schema),
        defaultValues: { password: '', confirmPassword: '' },
    });

    const onSubmit = async ({ password, confirmPassword }: ResetPasswordValues) => {
        setServerError('');
        try {
            await authService.resetPassword(token, password, confirmPassword);
            setIsDone(true);
        } catch (err) {
            setServerError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
        }
    };

    if (!token) {
        return (
            <section id="reset-password-page" className="page-content">
                <PageMeta title="Reset your password" noindex />
                <div className="login-page">
                    <h1>Reset link missing</h1>
                    <p className="login-subtitle">
                        This page needs the link from your reset email. Open the most recent
                        email we sent you, or request a new link.
                    </p>
                    <Link to="/forgot-password" className="forgot-password-back">
                        <ArrowLeft size={14} strokeWidth={2.25} />
                        Request a new link
                    </Link>
                </div>
            </section>
        );
    }

    if (isDone) {
        return (
            <section id="reset-password-page" className="page-content">
                <PageMeta title="Password updated" noindex />
                <div className="login-page">
                    <div className="forgot-password-icon">
                        <CheckCircle2 size={28} strokeWidth={2} />
                    </div>
                    <h1>Password updated</h1>
                    <p className="login-subtitle">
                        Your password has been reset and any previous sessions were signed out.
                        You can now sign in with your new password.
                    </p>
                    <Link to="/login" className="forgot-password-back">
                        <ArrowLeft size={14} strokeWidth={2.25} />
                        Go to sign in
                    </Link>
                </div>
            </section>
        );
    }

    return (
        <section id="reset-password-page" className="page-content">
            <PageMeta title="Set a new password" description="Choose a new password for your Bitcoin Learning Hub account." noindex />
            <div className="login-page">
                <h1>Set a new password</h1>
                <p className="login-subtitle">
                    Pick a strong password of at least 8 characters. You'll be signed out
                    everywhere else once it's saved.
                </p>

                <form className="login-form" onSubmit={handleSubmit(onSubmit)} noValidate>
                    <PasswordField
                        label="New password"
                        id="password"
                        placeholder="••••••••"
                        autoComplete="new-password"
                        error={errors.password?.message}
                        {...register('password')}
                    />

                    <PasswordField
                        label="Confirm new password"
                        id="confirmPassword"
                        placeholder="••••••••"
                        autoComplete="new-password"
                        error={errors.confirmPassword?.message}
                        {...register('confirmPassword')}
                    />

                    {serverError && <p className="field-error">{serverError}</p>}

                    <input
                        type="submit"
                        value={isSubmitting ? 'Saving...' : 'Save new password'}
                        className="btn-submit"
                        disabled={isSubmitting}
                    />

                    <p className="field-text">
                        Remembered it? <Link to="/login">Back to sign in</Link>
                    </p>
                </form>
            </div>
        </section>
    );
}
