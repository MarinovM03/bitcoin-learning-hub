import { useState } from 'react';
import { Flag } from 'lucide-react';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useBackdropClose } from '../../hooks/useBackdropClose';
import * as reportService from '../../services/reportService';
import { REPORT_REASONS } from '../../services/reportService';
import type { ReportTarget, ReportReason } from '../../services/reportService';
import { toast } from '../../lib/toast';

interface ReportModalProps {
    targetType: ReportTarget;
    targetId: string;
    targetLabel: string;
    onClose: () => void;
}

export default function ReportModal({ targetType, targetId, targetLabel, onClose }: ReportModalProps) {
    const [reason, setReason] = useState<ReportReason>('scam');
    const [note, setNote] = useState('');
    const [isSending, setIsSending] = useState(false);

    const trapRef = useFocusTrap<HTMLDivElement>(true, onClose);
    const backdropHandlers = useBackdropClose(onClose);

    const onSubmit = async () => {
        setIsSending(true);
        try {
            const { message } = await reportService.createReport({
                targetType,
                targetId,
                reason,
                note: note.trim() || undefined,
            });
            toast.success(message);
            onClose();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Could not send the report.');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="modal-overlay" {...backdropHandlers}>
            <div
                className="modal-box"
                onClick={(e) => e.stopPropagation()}
                ref={trapRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="report-modal-title"
            >
                <div className="modal-icon">
                    <Flag size={28} strokeWidth={1.8} />
                </div>
                <h3 className="modal-title" id="report-modal-title">Report this content</h3>
                <p className="modal-message">
                    A moderator will review it. Reports are private.
                </p>
                <p className="modal-sub-message report-modal-target">{targetLabel}</p>

                <fieldset className="report-reasons">
                    <legend className="report-reasons-legend">What's wrong with it?</legend>
                    {REPORT_REASONS.map(({ value, label }) => (
                        <label key={value} className="report-reason">
                            <input
                                type="radio"
                                name="report-reason"
                                value={value}
                                checked={reason === value}
                                onChange={() => setReason(value)}
                            />
                            <span>{label}</span>
                        </label>
                    ))}
                </fieldset>

                <textarea
                    className="report-note"
                    placeholder="Anything else the moderator should know? (optional)"
                    maxLength={300}
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                />

                <div className="modal-actions">
                    <button className="modal-btn modal-btn--cancel" onClick={onClose} disabled={isSending}>
                        Cancel
                    </button>
                    <button className="modal-btn modal-btn--confirm" onClick={onSubmit} disabled={isSending}>
                        {isSending ? 'Sending…' : 'Send report'}
                    </button>
                </div>
            </div>
        </div>
    );
}
