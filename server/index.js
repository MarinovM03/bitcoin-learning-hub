import 'dotenv/config';

import mongoose from 'mongoose';
import { createApp } from './app.js';

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
requireEnv('CLIENT_URL');
const MONGO_URI = requireEnv('MONGO_URI');

try {
    await mongoose.connect(MONGO_URI);
    console.log("Database Connected!");
} catch (err) {
    console.error("Database Error:", err);
    process.exit(1);
}

const app = createApp();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
