import * as request from '../utils/requester';
import { API_BASE_URL } from '../lib/apiConfig';

export type ReportTarget = 'article' | 'comment' | 'glossary';
export type ReportReason = 'spam' | 'scam' | 'abuse' | 'misinformation' | 'other';

export const REPORT_REASONS: { value: ReportReason; label: string }[] = [
    { value: 'scam', label: 'Scam or phishing' },
    { value: 'spam', label: 'Spam or advertising' },
    { value: 'misinformation', label: 'Misleading or incorrect' },
    { value: 'abuse', label: 'Abusive or hateful' },
    { value: 'other', label: 'Something else' },
];

export const createReport = (payload: {
    targetType: ReportTarget;
    targetId: string;
    reason: ReportReason;
    note?: string;
}): Promise<{ message: string }> =>
    request.post<{ message: string }>(`${API_BASE_URL}/reports`, payload);
