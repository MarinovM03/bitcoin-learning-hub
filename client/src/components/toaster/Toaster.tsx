import { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { subscribeToasts, dismissToast, type ToastItem } from '../../lib/toast';

const ICONS = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info,
} as const;

export default function Toaster() {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    useEffect(() => subscribeToasts(setToasts), []);

    if (toasts.length === 0) return null;

    return (
        <div className="toaster" role="region" aria-label="Notifications" aria-live="polite">
            {toasts.map((t) => {
                const Icon = ICONS[t.variant];
                return (
                    <div key={t.id} className={`toast toast--${t.variant}`} role="status">
                        <Icon size={18} strokeWidth={2.25} className="toast__icon" />
                        <span className="toast__message">{t.message}</span>
                        <button
                            type="button"
                            className="toast__close"
                            onClick={() => dismissToast(t.id)}
                            aria-label="Dismiss notification"
                        >
                            <X size={14} strokeWidth={2.5} />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
