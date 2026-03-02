# ────────────────────────────────────────────────────
# Stage 1 – deps  (cached layer for faster rebuilds)
# ────────────────────────────────────────────────────
FROM node:20-slim AS deps

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

# ────────────────────────────────────────────────────
# Stage 2 – runtime
# ────────────────────────────────────────────────────
FROM node:20-slim

# Non-root user for security
RUN groupadd --system appgroup && useradd --system --gid appgroup appuser

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY index.js .
COPY package.json .

# Cloud Run sets $PORT automatically; default to 8080
ENV PORT=8080
ENV NODE_ENV=production

EXPOSE 8080

USER appuser

CMD ["node", "index.js"]
