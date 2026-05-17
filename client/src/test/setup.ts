import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
    cleanup();
    localStorage.clear();
    vi.restoreAllMocks();
});

if (!import.meta.env.VITE_API_URL) {
    (import.meta as unknown as { env: Record<string, string> }).env.VITE_API_URL = 'http://localhost:5000';
}
