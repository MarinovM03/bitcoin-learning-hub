import { MongoMemoryServer } from 'mongodb-memory-server';

let mongo;

export async function setup() {
    mongo = await MongoMemoryServer.create();
    process.env.MONGO_URI = mongo.getUri();
}

export async function teardown() {
    await mongo?.stop();
}
