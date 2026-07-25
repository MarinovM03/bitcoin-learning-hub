import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { CheckCircle2, ArrowLeft, MailWarning } from "lucide-react";
import PageMeta from "../page-meta/PageMeta";
import Spinner from "../spinner/Spinner";
import { useAuth } from "../../contexts/AuthContext";
import * as authService from "../../services/authService";

type VerifyState = 'pending' | 'success' | 'error';

export default function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token') ?? '';
    const { updateAuthState, isAuthenticated } = useAuth();

    const [state, setState] = useState<VerifyState>(token ? 'pending' : 'error');
    const [message, setMessage] = useState(
        token ? '' : 'This page needs the link from your confirmation email.'
    );
    const hasRun = useRef(false);

    useEffect(() => {
        if (!token || hasRun.current) return;
        hasRun.current = true;

        authService.verifyEmail(token)
            .then((user) => {
                updateAuthState(user);
                setState('success');
            })
            .catch((err: unknown) => {
                setMessage(err instanceof Error ? err.message : 'We could not confirm this link.');
                setState('error');
            });
    }, [token, updateAuthState]);

    if (state === 'pending') {
        return (
            <section id="verify-email-page" className="page-content">
                <PageMeta title="Confirming your email" noindex />
                <div className="login-page">
                    <Spinner />
                    <p className="login-subtitle">Confirming your email address…</p>
                </div>
            </section>
        );
    }

    if (state === 'success') {
        return (
            <section id="verify-email-page" className="page-content">
                <PageMeta title="Email confirmed" noindex />
                <div className="login-page">
                    <div className="forgot-password-icon">
                        <CheckCircle2 size={28} strokeWidth={2} />
                    </div>
                    <h1>Email confirmed</h1>
                    <p className="login-subtitle">
                        Thanks — your address is confirmed. You can now publish articles,
                        write comments, and contribute glossary terms.
                    </p>
                    <Link to="/articles/create" className="forgot-password-back">
                        <ArrowLeft size={14} strokeWidth={2.25} />
                        Start writing
                    </Link>
                </div>
            </section>
        );
    }

    return (
        <section id="verify-email-page" className="page-content">
            <PageMeta title="Confirmation failed" noindex />
            <div className="login-page">
                <div className="forgot-password-icon verify-email-icon-warning">
                    <MailWarning size={28} strokeWidth={2} />
                </div>
                <h1>We couldn't confirm that link</h1>
                <p className="login-subtitle">{message}</p>
                <p className="field-text">
                    {isAuthenticated
                        ? 'Open your profile to send yourself a fresh confirmation link.'
                        : 'Sign in and we\'ll offer you a fresh confirmation link.'}
                </p>
                <Link to={isAuthenticated ? '/profile' : '/login'} className="forgot-password-back">
                    <ArrowLeft size={14} strokeWidth={2.25} />
                    {isAuthenticated ? 'Go to profile' : 'Go to sign in'}
                </Link>
            </div>
        </section>
    );
}
