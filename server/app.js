import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import router from './routes.js';
import { authMiddleware } from './middlewares/authMiddleware.js';
import { mongoSanitize } from './middlewares/mongoSanitize.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';

export const createApp = ({ disableRateLimit = false } = {}) => {
    const app = express();

    app.set('trust proxy', 1);

    app.use(helmet());
    app.use(express.json({ limit: '1mb' }));
    const allowedOrigins = (process.env.CLIENT_URL || '')
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);

    app.use(cors({
        origin(origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(null, false);
            }
        },
    }));
    app.use(mongoSanitize);
    app.use(authMiddleware);

    if (!disableRateLimit) {
        const authLimiter = rateLimit({
            windowMs: 15 * 60 * 1000,
            max: 20,
            message: { message: "Too many authentication attempts. Please try again in 15 minutes." },
            standardHeaders: true,
            legacyHeaders: false,
        });

        app.use('/users/login', authLimiter);
        app.use('/users/register', authLimiter);
        app.use('/users/forgot-password', authLimiter);
        app.use('/users/reset-password', authLimiter);

        const writeLimiter = rateLimit({
            windowMs: 15 * 60 * 1000,
            max: 100,
            message: { message: "Too many requests. Please try again in 15 minutes." },
            standardHeaders: true,
            legacyHeaders: false,
        });

        const readLimiter = rateLimit({
            windowMs: 15 * 60 * 1000,
            max: 600,
            message: { message: "Too many requests. Please try again in 15 minutes." },
            standardHeaders: true,
            legacyHeaders: false,
        });

        app.use((req, res, next) => {
            if (req.path === '/health') return next();
            if (req.method === 'GET') return readLimiter(req, res, next);
            return writeLimiter(req, res, next);
        });
    }

    app.use(router);
    app.use(notFoundHandler);
    app.use(errorHandler);

    return app;
};
