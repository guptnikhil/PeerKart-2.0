# Supabase Reverse Proxy

A lightweight Node.js/Express reverse proxy that sits in front of your Supabase project.  
Built for Google Cloud Run. Fixes Magic Links and OAuth callbacks when your Supabase project URL is blocked by network policies.

---

## File Structure

```
supabase-proxy/
├── index.js          ← Proxy server (express + http-proxy-middleware)
├── Dockerfile        ← Multi-stage node:20-slim image
├── package.json
├── deploy.sh         ← Cloud Run deployment script
├── .env.example      ← Environment variable template
└── README.md
```

---

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your values
```

Add these four extra variables to your `.env` before deploying:

| Variable | Example | Description |
|---|---|---|
| `SUPABASE_URL` | `https://abcxyz.supabase.co` | Your Supabase project URL |
| `PROXY_URL` | `https://my-proxy-abc.a.run.app` | Public URL of this proxy (after first deploy) |
| `SUPABASE_ANON_KEY` | `eyJ...` | Supabase `anon` public key |
| `FRONTEND_ORIGIN` | `https://www.peerkart.com` | Allowed CORS origin (`*` for dev) |
| `GCP_PROJECT_ID` | `my-gcp-project` | Google Cloud project ID |
| `GCP_REGION` | `asia-south1` | Cloud Run region |

### 3. Run locally

```bash
npm run dev
```

### 4. Deploy to Cloud Run

```bash
chmod +x deploy.sh
./deploy.sh
```

> **Two-step deploy note:** On the very first deploy `PROXY_URL` won't exist yet.  
> 1. Set `PROXY_URL` to a placeholder (e.g. `http://localhost`) and deploy once.  
> 2. Copy the Cloud Run service URL printed at the end.  
> 3. Update `PROXY_URL` in `.env` with the real URL, then run `./deploy.sh` again.

---

## Frontend Integration

Replace the Supabase URL in your `createClient` call with the proxy URL:

```ts
// Before
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(
  'https://YOUR_PROJECT_ID.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// After  ✅
const supabase = createClient(
  'https://YOUR_CLOUD_RUN_SERVICE_URL',   // <-- proxy URL
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

---

## Supabase Auth Dashboard Configuration

Go to **Supabase Dashboard → Authentication → URL Configuration** and update:

| Field | Value |
|---|---|
| **Site URL** | `https://YOUR_CLOUD_RUN_SERVICE_URL` |
| **Redirect URLs** | `https://YOUR_CLOUD_RUN_SERVICE_URL/**` |

This ensures Magic Link emails, OAuth callbacks, and email confirmation links all route through the proxy instead of directly to `supabase.co`.

---

## How the Response Interceptor Works

| Supabase Response | What the Proxy Does |
|---|---|
| `Location: https://abcxyz.supabase.co/auth/v1/callback` | Rewrites header to `https://YOUR_PROXY/auth/v1/callback` |
| JSON body containing `"https://abcxyz.supabase.co"` | Globally replaces with proxy URL |
| HTML body (e.g. email link preview) | Same global replace |
| Binary / other content types | Passed through unchanged |

---

## Health Check

```
GET /healthz
→ { "status": "ok", "ts": 1234567890 }
```

Cloud Run uses this endpoint for liveness probes automatically.
