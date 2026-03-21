import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import router from './routes.js';
import { authMiddleware } from './middlewares/authMiddleware.js';

const app = express();

app.use(express.json());
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
}));
app.use(authMiddleware);

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { message: "Too many login attempts. Please try again in 15 minutes." },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/users/login', loginLimiter);
app.use('/users/register', loginLimiter);

const connectionString = process.env.MONGO_URI;

try {
    await mongoose.connect(connectionString);
    console.log("Database Connected!");
} catch (err) {
    console.error("Database Error:", err);
    process.exit(1);
}

app.use(router);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));