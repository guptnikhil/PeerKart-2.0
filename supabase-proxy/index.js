'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { createProxyMiddleware, responseInterceptor } = require('http-proxy-middleware');

// ─── Config ──────────────────────────────────────────────────────────────────

const PORT            = process.env.PORT            || 3000;
const SUPABASE_URL    = process.env.SUPABASE_URL;    // e.g. https://abcxyz.supabase.co
const PROXY_URL       = process.env.PROXY_URL;       // e.g. https://my-proxy-abc123-xx.a.run.app
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN; // e.g. https://www.peerkart.com  (or * for testing)
const SUPABASE_ANON_KEY     = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY  = process.env.SUPABASE_SERVICE_KEY; // optional, for server-side usage

if (!SUPABASE_URL || !PROXY_URL) {
  console.error('❌  SUPABASE_URL and PROXY_URL env vars are required.');
  process.exit(1);
}

// Derive the bare hostname from SUPABASE_URL so we can rewrite it in bodies
const supabaseHost = new URL(SUPABASE_URL).host; // e.g. abcxyz.supabase.co
const proxyHost    = new URL(PROXY_URL).origin;  // e.g. https://my-proxy-abc123-xx.a.run.app

// ─── App ─────────────────────────────────────────────────────────────────────

const app = express();

// ─── CORS ────────────────────────────────────────────────────────────────────

const corsOptions = {
  origin: FRONTEND_ORIGIN && FRONTEND_ORIGIN !== '*'
    ? FRONTEND_ORIGIN.split(',').map(s => s.trim())
    : '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'apikey',
    'X-Client-Info',
    'X-Supabase-Api-Version',
    'Prefer',
    'Range',
  ],
  exposedHeaders: ['Content-Range', 'Range', 'X-Total-Count'],
  credentials: FRONTEND_ORIGIN && FRONTEND_ORIGIN !== '*',
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

// Handle OPTIONS preflight explicitly (belt-and-suspenders)
app.options('*', cors(corsOptions));

// ─── Health check ─────────────────────────────────────────────────────────────

app.get('/healthz', (_req, res) => res.json({ status: 'ok', ts: Date.now() }));

// ─── Proxy ───────────────────────────────────────────────────────────────────

/**
 * Rewrite any occurrence of the Supabase host in a string buffer with the
 * Proxy URL origin.  Handles both https://... and protocol-relative //...
 */
function rewriteBody(body) {
  // Replace https://abcxyz.supabase.co  → PROXY_URL origin
  return body
    .replace(new RegExp(`https://${escapeRegex(supabaseHost)}`, 'g'), proxyHost)
    // Also catch protocol-relative references
    .replace(new RegExp(`//${escapeRegex(supabaseHost)}`, 'g'), proxyHost.replace(/^https?:/, ''));
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const proxyMiddleware = createProxyMiddleware({
  target: SUPABASE_URL,
  changeOrigin: true,

  // Always set the required Supabase headers; let per-request Authorization pass through
  headers: {
    apikey: SUPABASE_ANON_KEY || '',
  },

  // selfHandleResponse must be true to use responseInterceptor
  selfHandleResponse: true,

  on: {
    // ── Request hook: ensure apikey & Content-Type are forwarded ──
    proxyReq(proxyReq, req) {
      // Forward apikey from the incoming request if present; otherwise inject the anon key
      const apikey = req.headers['apikey'] || req.headers['x-apikey'] || SUPABASE_ANON_KEY;
      if (apikey) proxyReq.setHeader('apikey', apikey);

      // Forward Authorization (Bearer token from Supabase session)
      if (req.headers['authorization']) {
        proxyReq.setHeader('Authorization', req.headers['authorization']);
      }

      if (req.headers['content-type']) {
        proxyReq.setHeader('Content-Type', req.headers['content-type']);
      }
    },

    // ── Response interceptor: rewrite Location headers + body URLs ──
    proxyRes: responseInterceptor(async (responseBuffer, proxyRes, _req, res) => {
      // ── 1. Rewrite Location header (OAuth / Magic Link redirects) ──
      const location = proxyRes.headers['location'];
      if (location && location.includes(supabaseHost)) {
        const newLocation = location.replace(
          new RegExp(`https?://${escapeRegex(supabaseHost)}`, 'g'),
          proxyHost
        );
        res.setHeader('Location', newLocation);
      }

      // ── 2. Rewrite body for JSON and HTML responses ──
      const contentType = (proxyRes.headers['content-type'] || '').toLowerCase();
      const isTextLike  = contentType.includes('json') ||
                          contentType.includes('html') ||
                          contentType.includes('text');

      if (!isTextLike) return responseBuffer; // binary: return as-is

      const bodyStr     = responseBuffer.toString('utf8');
      const rewritten   = rewriteBody(bodyStr);

      return rewritten;
    }),

    error(err, _req, res) {
      console.error('Proxy error:', err.message);
      res.status(502).json({ error: 'Bad Gateway', detail: err.message });
    },
  },
});

// Mount proxy for all other paths
app.use('/', proxyMiddleware);

// ─── Start ───────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`✅  Supabase proxy running on port ${PORT}`);
  console.log(`   Proxying → ${SUPABASE_URL}`);
  console.log(`   Proxy URL (public): ${PROXY_URL}`);
});
