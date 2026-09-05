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
        if (!siteUrl) {
            console.warn('[build] VITE_SITE_URL is not set — social preview images will ship as relative URLs and will not render when the site is shared.');
        }
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

const readOrigin = (value: string | undefined, name: string, required: boolean): string => {
    const trimmed = value?.trim() ?? '';

    if (!trimmed) {
        if (required) {
            throw new Error(`[build] ${name} is not set. Define it in the client environment before building.`);
        }
        return '';
    }

    let parsed: URL;
    try {
        parsed = new URL(trimmed);
    } catch {
        throw new Error(`[build] ${name} is not a valid URL: "${trimmed}". Use an absolute origin such as https://api.example.com.`);
    }

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        throw new Error(`[build] ${name} must use http or https, but got "${parsed.protocol}".`);
    }

    return parsed.origin;
};

// https://vite.dev/config/
export default defineConfig(({ mode, command }) => {
    const env = loadEnv(mode, '.', 'VITE_');
    const apiOrigin = readOrigin(env.VITE_API_URL, 'VITE_API_URL', command === 'build');
    const siteUrl = readOrigin(env.VITE_SITE_URL, 'VITE_SITE_URL', false);
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
