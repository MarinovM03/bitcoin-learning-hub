import 'dotenv/config';

import mongoose from 'mongoose';
import User from '../models/User.js';
import Article from '../models/Article.js';
import GlossaryTerm from '../models/GlossaryTerm.js';
import { hasEarnedTrust } from '../utils/trust.js';

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
    console.error('[backfill] MONGO_URI is not set.');
    process.exit(1);
}

await mongoose.connect(MONGO_URI);

const terms = await GlossaryTerm.updateMany(
    { status: { $exists: false } },
    { $set: { status: 'published' } },
);
console.log(`[backfill] Published ${terms.modifiedCount} pre-existing glossary term(s).`);

const users = await User.find({ isTrusted: { $exists: false } }).select('_id username');
let trusted = 0;

for (const user of users) {
    const approvedArticles = await Article.countDocuments({
        _ownerId: user._id,
        status: 'published',
    });
    const isTrusted = hasEarnedTrust(approvedArticles);
    if (isTrusted) trusted++;

    await User.updateOne({ _id: user._id }, { $set: { approvedArticles, isTrusted } });
}

console.log(`[backfill] Scored ${users.length} account(s); ${trusted} already qualify to publish without review.`);

await mongoose.disconnect();
