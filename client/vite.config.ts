import { defineConfig, loadEnv } from 'vite';
import type { Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const buildCsp = (apiOrigin: string): string => {
    const connectSrc = [
        "'self'",
        apiOrigin,
        'https://api.binance.com',
        'https://api.alternative.me',
        'https://mempool.space',
    ].filter(Boolean).join(' ');

    return [
        "default-src 'self'",
        "script-src 'self'",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' data: https://fonts.gstatic.com",
        "img-src 'self' data: https:",
        `connect-src ${connectSrc}`,
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
    ].join('; ');
};

const cspPlugin = (apiOrigin: string): Plugin => ({
    name: 'inject-csp',
    apply: 'build',
    transformIndexHtml(html) {
        const meta = `<meta http-equiv="Content-Security-Policy" content="${buildCsp(apiOrigin)}">`;
        return html.replace('</title>', `</title>\n    ${meta}`);
    },
});

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', 'VITE_');
    const apiOrigin = env.VITE_API_URL?.match(/^https?:\/\/[^/]+/)?.[0] ?? '';

    return {
        plugins: [react(), cspPlugin(apiOrigin)],
        build: {
            rollupOptions: {
                output: {
                    manualChunks: {
                        'react-vendor': ['react', 'react-dom', 'react-router'],
                        recharts: ['recharts'],
                        markdown: ['react-markdown', 'remark-gfm', 'rehype-sanitize'],
                    },
                },
            },
        },
    };
});
