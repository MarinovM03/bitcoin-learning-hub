export const parseApiError = (err: unknown): string => {
    if (typeof err === 'string') return err;

    if (err && typeof err === 'object' && 'message' in err) {
        const message = (err as { message?: unknown }).message;

        if (message === 'Failed to fetch') {
            return 'Unable to connect to the server. Please try again later.';
        }

        if (typeof message === 'string' && message.length > 0) {
            return message;
        }
    }

    return 'Something went wrong. Please try again.';
};
