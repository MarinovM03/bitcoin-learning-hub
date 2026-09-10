import 'dotenv/config';

import mongoose from 'mongoose';
import Article from '../models/Article.js';
import { uniqueSlug } from '../utils/slugify.js';

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
    console.error('[backfill] MONGO_URI is not set.');
    process.exit(1);
}

mongoose.set('autoIndex', false);
await mongoose.connect(MONGO_URI);

const pending = await Article.find({
    $or: [{ slug: { $exists: false } }, { slug: null }, { slug: '' }],
}).select('_id title').sort({ createdAt: 1 }).lean();

let filled = 0;

for (const article of pending) {
    const slug = await uniqueSlug(Article, article.title, article._id, 'article');
    await Article.updateOne({ _id: article._id }, { $set: { slug, previousSlugs: [] } });
    filled += 1;
    console.log(`[backfill] ${article.title} -> ${slug}`);
}

console.log(`[backfill] Done. ${filled} article${filled === 1 ? '' : 's'} given an address.`);

await mongoose.disconnect();
