import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import router from './routes.js';
import { authMiddleware } from './middlewares/authMiddleware.js';
import { mongoSanitize } from './middlewares/mongoSanitize.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';

const requireEnv = (name, { minLength = 0 } = {}) => {
    const value = process.env[name];
    if (!value) {
        console.error(`[config] Missing required environment variable: ${name}`);
        process.exit(1);
    }
    if (minLength && value.length < minLength) {
        console.error(`[config] ${name} must be at least ${minLength} characters long`);
        process.exit(1);
    }
    return value;
};

requireEnv('JWT_SECRET', { minLength: 32 });
const CLIENT_URL = requireEnv('CLIENT_URL');
const MONGO_URI = requireEnv('MONGO_URI');

const app = express();

app.set('trust proxy', 1);

app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(cors({
    origin: CLIENT_URL,
    credentials: true,
}));
app.use(mongoSanitize);
app.use(authMiddleware);

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { message: "Too many authentication attempts. Please try again in 15 minutes." },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/users/login', authLimiter);
app.use('/users/register', authLimiter);

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

try {
    await mongoose.connect(MONGO_URI);
    console.log("Database Connected!");
} catch (err) {
    console.error("Database Error:", err);
    process.exit(1);
}

app.use(router);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));