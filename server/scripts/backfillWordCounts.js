import 'dotenv/config';

import mongoose from 'mongoose';
import Article from '../models/Article.js';

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
    console.error('[backfill] MONGO_URI is not set.');
    process.exit(1);
}

mongoose.set('autoIndex', false);
await mongoose.connect(MONGO_URI);

const pending = await Article.find({
    $or: [{ wordCount: { $exists: false } }, { wordCount: 0 }],
}).select('_id title content').lean();

let filled = 0;

for (const article of pending) {
    const wordCount = (article.content ?? '').trim().split(/\s+/).filter(Boolean).length;
    if (wordCount === 0) continue;

    await Article.updateOne({ _id: article._id }, { $set: { wordCount } });
    filled += 1;
    console.log(`[backfill] ${article.title} -> ${wordCount} words`);
}

console.log(`[backfill] Done. ${filled} article${filled === 1 ? '' : 's'} counted.`);

await mongoose.disconnect();
