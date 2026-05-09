import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router";
import { z } from "zod";
import { Mail, ArrowLeft } from "lucide-react";
import PageMeta from "../page-meta/PageMeta";
import * as request from "../../utils/requester";

const schema = z.object({
    email: z
        .string()
        .trim()
        .regex(/.+@.+\..+/, 'Please enter a valid email address'),
});

export default function ForgotPassword() {
    const [submittedEmail, setSubmittedEmail] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(schema),
        defaultValues: { email: '' },
    });

    const onSubmit = async ({ email }) => {
        try {
            await request.post(`${import.meta.env.VITE_API_URL}/users/forgot-password`, { email });
        } catch {
            // Swallow errors so the response is uniform; once the endpoint
            // exists this catch becomes effectively a no-op.
        }
        setSubmittedEmail(email);
    };

    if (submittedEmail) {
        return (
            <section id="forgot-password-page" className="page-content">
                <PageMeta title="Check your inbox" description="Password reset request sent." />
                <div className="login-page">
                    <div className="forgot-password-icon">
                        <Mail size={28} strokeWidth={2} />
                    </div>
                    <h1>Check your inbox</h1>
                    <p className="login-subtitle">
                        If an account exists for <strong>{submittedEmail}</strong>, we've sent reset
                        instructions. The link expires in 30 minutes.
                    </p>
                    <p className="forgot-password-hint">
                        Didn't get an email? Check your spam folder, or{' '}
                        <button
                            type="button"
                            className="link-button"
                            onClick={() => setSubmittedEmail('')}
                        >
                            try a different address
                        </button>.
                    </p>
                    <Link to="/login" className="forgot-password-back">
                        <ArrowLeft size={14} strokeWidth={2.25} />
                        Back to sign in
                    </Link>
                </div>
            </section>
        );
    }

    return (
        <section id="forgot-password-page" className="page-content">
            <PageMeta title="Reset your password" description="Recover access to your Bitcoin Learning Hub account." />
            <div className="login-page">
                <h1>Reset your password</h1>
                <p className="login-subtitle">
                    Enter the email tied to your account and we'll send you a link to set a new password.
                </p>

                <form className="login-form" onSubmit={handleSubmit(onSubmit)} noValidate>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            placeholder="your@email.com"
                            autoComplete="email"
                            {...register('email')}
                        />
                        {errors.email && <p className="field-error">{errors.email.message}</p>}
                    </div>

                    <input
                        type="submit"
                        value={isSubmitting ? 'Sending...' : 'Send reset link'}
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
