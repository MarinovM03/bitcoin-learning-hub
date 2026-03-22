export const parseApiError = (err) => {
    if (typeof err === 'string') return err;

    if (err?.message === 'Failed to fetch') {
        return 'Unable to connect to the server. Please try again later.';
    }

    if (err?.message) return err.message;

    return 'Something went wrong. Please try again.';
};` `