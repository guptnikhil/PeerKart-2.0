/**
 * Cloudflare Worker — Supabase Reverse Proxy
 *
 * Deploy steps:
 *   1. Go to https://dash.cloudflare.com → Workers & Pages
 *   2. Open your "white-block-25e5" worker → Edit Code
 *   3. Replace ALL existing code with this file → Save & Deploy
 *
 * How it works:
 *   - All requests to workers.dev are forwarded to your real Supabase project
 *   - Location headers and body URLs are rewritten so Magic Links / OAuth
 *     callbacks point back to this Worker URL, not the blocked supabase.co domain
 */

// ─── Config ──────────────────────────────────────────────────────────────────

const SUPABASE_URL = 'https://zngduahebpsxqvaxdkzj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpuZ2R1YWhlYnBzeHF2YXhka3pqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNzk3OTAsImV4cCI6MjA4Nzg1NTc5MH0.L1PTfn7rd67zwOCMOcNZjf8RFbygObwddrwEgrQaGag';
const PROXY_URL = 'https://white-block-25e5.guptnikhil996.workers.dev';
const SUPABASE_HOST = 'zngduahebpsxqvaxdkzj.supabase.co';

// Allowed frontend origins (comma-separated)
const ALLOWED_ORIGINS = [
    'https://www.peerkart.com',
    'https://peerkart.com',
    'http://localhost:3000',
    'http://localhost:5173',
];

// ─── CORS helpers ─────────────────────────────────────────────────────────────

function getCorsHeaders(requestOrigin) {
    const origin = ALLOWED_ORIGINS.includes(requestOrigin) ? requestOrigin : ALLOWED_ORIGINS[0];
    return {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, X-Client-Info, X-Supabase-Api-Version, Prefer, Range',
        'Access-Control-Expose-Headers': 'Content-Range, Range, X-Total-Count',
        'Access-Control-Max-Age': '86400',
    };
}

// ─── URL rewriter ─────────────────────────────────────────────────────────────

function rewriteUrls(text) {
    return text
        .replace(new RegExp(`https://${SUPABASE_HOST}`, 'g'), PROXY_URL)
        .replace(new RegExp(`//${SUPABASE_HOST}`, 'g'), PROXY_URL.replace(/^https?:/, ''));
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export default {
    async fetch(request, _env, _ctx) {
        const url = new URL(request.url);
        const origin = request.headers.get('Origin') || '';

        // ── Health check ──
        if (url.pathname === '/healthz') {
            return new Response(JSON.stringify({ status: 'ok', ts: Date.now() }), {
                headers: { 'Content-Type': 'application/json', ...getCorsHeaders(origin) },
            });
        }

        // ── CORS preflight ──
        if (request.method === 'OPTIONS') {
            return new Response(null, { status: 204, headers: getCorsHeaders(origin) });
        }

        // ── Build upstream request ──
        const targetUrl = `${SUPABASE_URL}${url.pathname}${url.search}`;

        const upstreamHeaders = new Headers(request.headers);

        // Always inject apikey; prefer one from incoming request
        if (!upstreamHeaders.has('apikey')) {
            upstreamHeaders.set('apikey', SUPABASE_ANON_KEY);
        }

        // Remove host header so Cloudflare doesn't send the worker host to Supabase
        upstreamHeaders.delete('host');
        upstreamHeaders.delete('cf-connecting-ip');
        upstreamHeaders.delete('cf-ipcountry');
        upstreamHeaders.delete('cf-ray');
        upstreamHeaders.delete('cf-visitor');

        const upstreamRequest = new Request(targetUrl, {
            method: request.method,
            headers: upstreamHeaders,
            body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
            redirect: 'manual', // handle redirects ourselves so we can rewrite Location
        });

        // ── Fetch from Supabase ──
        let upstreamResponse;
        try {
            upstreamResponse = await fetch(upstreamRequest);
        } catch (err) {
            return new Response(JSON.stringify({ error: 'Bad Gateway', detail: String(err) }), {
                status: 502,
                headers: { 'Content-Type': 'application/json', ...getCorsHeaders(origin) },
            });
        }

        // ── Build response headers ──
        const responseHeaders = new Headers(upstreamResponse.headers);

        // Add CORS headers to every response
        for (const [k, v] of Object.entries(getCorsHeaders(origin))) {
            responseHeaders.set(k, v);
        }

        // ── Rewrite Location header (Magic Link / OAuth redirects) ──
        const location = responseHeaders.get('location');
        if (location && location.includes(SUPABASE_HOST)) {
            responseHeaders.set('location', rewriteUrls(location));
        }

        // ── Rewrite body for JSON / HTML responses ──
        const contentType = (responseHeaders.get('content-type') || '').toLowerCase();
        const isTextLike = contentType.includes('json') ||
            contentType.includes('html') ||
            contentType.includes('text');

        let body;
        if (isTextLike && upstreamResponse.body) {
            const text = await upstreamResponse.text();
            const rewritten = rewriteUrls(text);
            body = rewritten;
            // Update content-length since body may have changed size
            responseHeaders.delete('content-length');
        } else {
            body = upstreamResponse.body;
        }

        return new Response(body, {
            status: upstreamResponse.status,
            headers: responseHeaders,
        });
    },
};
