import 'dotenv/config';

import mongoose from 'mongoose';
import User from '../models/User.js';

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
    console.error('[backfill] MONGO_URI is not set.');
    process.exit(1);
}

await mongoose.connect(MONGO_URI);

const result = await User.updateMany(
    { emailVerified: { $exists: false } },
    { $set: { emailVerified: true } },
);

console.log(`[backfill] Marked ${result.modifiedCount} pre-existing account(s) as verified.`);

await mongoose.disconnect();
