#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
#  deploy.sh  –  Build & deploy the Supabase proxy to Google Cloud Run
#
#  Usage:
#    chmod +x deploy.sh
#    ./deploy.sh
#
#  Prerequisites:
#    • gcloud CLI installed & authenticated  (gcloud auth login)
#    • docker (only if building locally; Cloud Build is used by default)
#    • .env file with values filled in  (copy from .env.example)
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

# ── Load .env ────────────────────────────────────────────────────────────────
if [[ -f .env ]]; then
  # Export all variables, skip comments and empty lines
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
else
  echo "❌  .env file not found. Copy .env.example → .env and fill in your values."
  exit 1
fi

# ── Required variables ────────────────────────────────────────────────────────
: "${GCP_PROJECT_ID:?Set GCP_PROJECT_ID in .env}"
: "${GCP_REGION:?Set GCP_REGION in .env}"
: "${SUPABASE_URL:?Set SUPABASE_URL in .env}"
: "${SUPABASE_ANON_KEY:?Set SUPABASE_ANON_KEY in .env}"
: "${PROXY_URL:?Set PROXY_URL in .env}"

SERVICE_NAME="${SERVICE_NAME:-supabase-proxy}"
IMAGE="gcr.io/${GCP_PROJECT_ID}/${SERVICE_NAME}"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " Supabase Proxy → Cloud Run Deployment"
echo " Project  : ${GCP_PROJECT_ID}"
echo " Region   : ${GCP_REGION}"
echo " Service  : ${SERVICE_NAME}"
echo " Image    : ${IMAGE}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ── 1. Set active project ─────────────────────────────────────────────────────
echo ""
echo "▶  Setting active GCP project..."
gcloud config set project "${GCP_PROJECT_ID}"

# ── 2. Enable required APIs ───────────────────────────────────────────────────
echo ""
echo "▶  Enabling required GCP APIs (this may take a minute the first time)..."
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  containerregistry.googleapis.com \
  --project="${GCP_PROJECT_ID}"

# ── 3. Build image via Cloud Build ────────────────────────────────────────────
echo ""
echo "▶  Building Docker image with Cloud Build..."
gcloud builds submit \
  --tag "${IMAGE}" \
  --project="${GCP_PROJECT_ID}" \
  .

# ── 4. Deploy to Cloud Run ────────────────────────────────────────────────────
echo ""
echo "▶  Deploying to Cloud Run..."
gcloud run deploy "${SERVICE_NAME}" \
  --image "${IMAGE}" \
  --platform managed \
  --region "${GCP_REGION}" \
  --allow-unauthenticated \
  --port 8080 \
  --set-env-vars "SUPABASE_URL=${SUPABASE_URL}" \
  --set-env-vars "PROXY_URL=${PROXY_URL}" \
  --set-env-vars "SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}" \
  --set-env-vars "FRONTEND_ORIGIN=${FRONTEND_ORIGIN:-*}" \
  --set-env-vars "NODE_ENV=production" \
  --project="${GCP_PROJECT_ID}"

# ── 5. Fetch the deployed URL ─────────────────────────────────────────────────
echo ""
DEPLOYED_URL=$(gcloud run services describe "${SERVICE_NAME}" \
  --platform managed \
  --region "${GCP_REGION}" \
  --format "value(status.url)" \
  --project="${GCP_PROJECT_ID}")

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅  Deployment complete!"
echo ""
echo "   Service URL : ${DEPLOYED_URL}"
echo ""
echo "   Next steps:"
echo "   1. If PROXY_URL in .env doesn't match the URL above, update it."
echo "      Then re-run this script so Magic Links point to the right host."
echo "   2. Add ${DEPLOYED_URL} to Supabase → Authentication → URL Configuration:"
echo "      • Site URL"
echo "      • Redirect URLs (add ${DEPLOYED_URL}/**)"
echo "   3. Update your frontend createClient() to use the proxy URL."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
