import { AppError } from '../utils/AppError.js';

export const notFoundHandler = (req, res, next) => {
    next(new AppError(404, `Route ${req.method} ${req.originalUrl} not found`));
};

export const errorHandler = (err, req, res, _next) => {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({ message: err.message });
    }

    if (err?.name === 'ValidationError') {
        const firstMessage = Object.values(err.errors || {})[0]?.message || 'Validation failed';
        return res.status(400).json({ message: firstMessage });
    }

    if (err?.name === 'CastError') {
        return res.status(404).json({ message: 'Resource not found' });
    }

    if (err?.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0] || 'field';
        return res.status(409).json({ message: `${field} already exists` });
    }

    if (err?.name === 'ZodError') {
        const firstIssue = err.issues?.[0];
        const message = firstIssue?.message || 'Invalid request';
        return res.status(400).json({ message });
    }

    console.error('[Unhandled error]', err);
    res.status(500).json({ message: 'Something went wrong' });
};
