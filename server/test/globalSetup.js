import { MongoMemoryServer } from 'mongodb-memory-server';

const BINARY_VERSION = '7.0.24';
const STARTUP_TIMEOUT_MS = 60_000;

let mongo;

export async function setup() {
    process.env.MONGOMS_INSTANCE_STARTUP_TIMEOUT = String(STARTUP_TIMEOUT_MS);

    mongo = await MongoMemoryServer.create({
        binary: { version: BINARY_VERSION },
    });
    process.env.MONGO_URI = mongo.getUri();
}

export async function teardown() {
    await mongo?.stop();
}
