import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: false,
        environment: 'node',
        setupFiles: ['./test/setup.js'],
        testTimeout: 30_000,
        hookTimeout: 600_000,
        pool: 'forks',
        poolOptions: { forks: { singleFork: true } },
        isolate: false,
    },
});
