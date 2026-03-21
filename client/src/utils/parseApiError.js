export const parseApiError = (err) => {
    if (typeof err === 'string') return err;
    if (err?.message) return err.message;
    return 'Something went wrong. Please try again.';
};