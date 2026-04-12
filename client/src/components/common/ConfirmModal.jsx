import { Trash2 } from "lucide-react";

export default function ConfirmModal({
    icon,
    title = "Are you sure?",
    message,
    subMessage,
    confirmLabel = "Delete",
    onConfirm,
    onCancel
}) {
    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                <div className="modal-icon">
                    {icon ?? <Trash2 size={28} strokeWidth={1.8} />}
                </div>
                <h3 className="modal-title">{title}</h3>
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
