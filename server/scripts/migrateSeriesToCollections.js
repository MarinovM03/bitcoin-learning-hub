import 'dotenv/config';

import mongoose from 'mongoose';
import Article from '../models/Article.js';
import Collection from '../models/Collection.js';
import { uniqueSlug } from '../utils/slugify.js';

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
    console.error('[migrate] MONGO_URI is not set.');
    process.exit(1);
}

await mongoose.connect(MONGO_URI);

const grouped = await Article.aggregate([
    { $match: { seriesName: { $type: 'string', $gt: '' } } },
    { $sort: { seriesPart: 1, createdAt: 1 } },
    {
        $group: {
            _id: { owner: '$_ownerId', name: '$seriesName' },
            articles: { $push: '$_id' },
        },
    },
]);

let created = 0;
let skipped = 0;

for (const group of grouped) {
    const { owner, name } = group._id;

    const existing = await Collection.findOne({ _ownerId: owner, title: name });
    if (existing) {
        skipped += 1;
        console.log(`[migrate] already present: "${name}"`);
        continue;
    }

    await Collection.create({
        title: name,
        slug: await uniqueSlug(Collection, name),
        description: '',
        coverImage: '',
        articles: group.articles,
        _ownerId: owner,
    });

    created += 1;
    console.log(`[migrate] created "${name}" with ${group.articles.length} articles`);
}

console.log(`[migrate] done — ${created} created, ${skipped} already existed`);

await mongoose.disconnect();
