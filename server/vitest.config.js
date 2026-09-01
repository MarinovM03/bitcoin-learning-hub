import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: false,
        environment: 'node',
        globalSetup: ['./test/globalSetup.js'],
        setupFiles: ['./test/setup.js'],
        testTimeout: 30_000,
        hookTimeout: 600_000,
        pool: 'forks',
        maxWorkers: 1,
        minWorkers: 1,
        isolate: false,
        fileParallelism: false,
    },
});
