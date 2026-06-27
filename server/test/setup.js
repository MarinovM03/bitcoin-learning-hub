import { beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-please-make-this-at-least-32-chars';
process.env.CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGO_URI);
    }
});

afterAll(async () => {
    await mongoose.disconnect();
});

beforeEach(async () => {
    const { collections } = mongoose.connection;
    for (const key of Object.keys(collections)) {
        await collections[key].deleteMany({});
    }
});
