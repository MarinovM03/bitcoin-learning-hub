import type { ReactNode } from "react";
import { Trash2 } from "lucide-react";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import { useBackdropClose } from "../../hooks/useBackdropClose";

interface ConfirmModalProps {
    icon?: ReactNode;
    title?: string;
    message?: ReactNode;
    subMessage?: ReactNode;
    confirmLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmModal({
    icon,
    title = "Are you sure?",
    message,
    subMessage,
    confirmLabel = "Delete",
    onConfirm,
    onCancel,
}: ConfirmModalProps) {
    const trapRef = useFocusTrap<HTMLDivElement>(true, onCancel);
    const backdropHandlers = useBackdropClose(onCancel);

    return (
        <div className="modal-overlay" {...backdropHandlers}>
            <div
                className="modal-box"
                onClick={(e) => e.stopPropagation()}
                ref={trapRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirm-modal-title"
            >
                <div className="modal-icon">
                    {icon ?? <Trash2 size={28} strokeWidth={1.8} />}
                </div>
                <h3 className="modal-title" id="confirm-modal-title">{title}</h3>
                <p className="modal-message">{message}</p>
                {subMessage && <p className="modal-sub-message">{subMessage}</p>}
                <div className="modal-actions">
                    <button className="modal-btn modal-btn--cancel" onClick={onCancel}>
                        Cancel
                    </button>
                    <button className="modal-btn modal-btn--confirm" onClick={onConfirm}>
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
