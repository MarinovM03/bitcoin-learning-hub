const RESEND_ENDPOINT = 'https://api.resend.com/emails';
const SEND_TIMEOUT_MS = 10_000;

export const sendEmail = async ({ to, subject, html, text }) => {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM || 'Bitcoin Learning Hub <onboarding@resend.dev>';
    const isProduction = process.env.NODE_ENV === 'production';

    if (!isProduction) {
        console.info(`[email] To: ${to}\n[email] Subject: ${subject}\n[email] ${text}`);
    }

    if (!apiKey) {
        console.warn('[email] RESEND_API_KEY is not set — nothing was delivered.');
        return { delivered: false };
    }

    const response = await fetch(RESEND_ENDPOINT, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ from, to, subject, html, text }),
        signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
    });

    if (!response.ok) {
        if (!isProduction) {
            console.warn(`[email] Provider responded with ${response.status} — nothing was delivered.`);
            return { delivered: false };
        }
        throw new Error(`Email provider responded with ${response.status}`);
    }

    return { delivered: true };
};
