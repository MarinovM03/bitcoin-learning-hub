import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
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

const absoluteOgImagePlugin = (siteUrl: string): Plugin => ({
    name: 'resolve-og-image-url',
    apply: 'build',
    transformIndexHtml(html) {
        return html.replace(/__SITE_URL__/g, siteUrl.replace(/\/$/, ''));
    },
});

const robotsPlugin = (sitemapUrl: string): Plugin => ({
    name: 'resolve-robots-sitemap-url',
    apply: 'build',
    writeBundle(options) {
        const outDir = options.dir ?? resolve(process.cwd(), 'dist');
        const robotsPath = resolve(outDir, 'robots.txt');
        if (!existsSync(robotsPath)) return;

        const contents = readFileSync(robotsPath, 'utf8');
        const resolved = sitemapUrl
            ? contents.replace(/__SITEMAP_URL__/g, sitemapUrl)
            : contents.replace(/^Sitemap: __SITEMAP_URL__.*$/m, '').trimEnd() + '\n';

        if (!sitemapUrl) {
            console.warn('[build] VITE_API_URL is not set — robots.txt will ship without a Sitemap line.');
        }
        writeFileSync(robotsPath, resolved);
    },
});

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', 'VITE_');
    const apiOrigin = env.VITE_API_URL?.match(/^https?:\/\/[^/]+/)?.[0] ?? '';
    const siteUrl = env.VITE_SITE_URL?.trim() ?? '';
    const sitemapUrl = apiOrigin ? `${apiOrigin}/sitemap.xml` : '';

    return {
        plugins: [react(), cspPlugin(apiOrigin), absoluteOgImagePlugin(siteUrl), robotsPlugin(sitemapUrl)],
        build: {
            rollupOptions: {
                output: {
                    manualChunks: {
                        'react-vendor': ['react', 'react-dom', 'react-router'],
                    },
                },
            },
        },
    };
});
