import { useState } from "react";
import { useLocation } from "react-router";
import { MailWarning } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import * as authService from "../../services/authService";
import { toast } from "../../lib/toast";

const HIDDEN_ON = ['/verify-email', '/login', '/register'];

export default function EmailVerificationNotice() {
    const { isAuthenticated, isEmailVerified, email } = useAuth();
    const { pathname } = useLocation();
    const [isSending, setIsSending] = useState(false);

    if (!isAuthenticated || isEmailVerified || HIDDEN_ON.includes(pathname)) {
        return null;
    }

    const onResend = async () => {
        setIsSending(true);
        try {
            const { message } = await authService.resendVerification();
            toast.success(message);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Could not send the confirmation email.');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="verification-notice" role="status">
            <MailWarning size={18} strokeWidth={2} aria-hidden="true" />
            <p className="verification-notice-text">
                Confirm your email{email ? ` (${email})` : ''} to publish articles, comment, and add glossary terms.
            </p>
            <button
                type="button"
                className="verification-notice-action"
                onClick={onResend}
                disabled={isSending}
            >
                {isSending ? 'Sending…' : 'Resend link'}
            </button>
        </div>
    );
}
