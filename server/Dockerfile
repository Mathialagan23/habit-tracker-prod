# ─────────────────────────────────────────────────────────────────────────────
# Habit Tracker — Backend
#
# Runtime : Node.js 22 Alpine
#           (matches local dev runtime; ARCHITECTURE.md requires 18+)
# Port    : 8080  (Cloud Run default; config/index.js reads process.env.PORT)
# Entry   : node src/server.js  (package.json "start" script)
# ─────────────────────────────────────────────────────────────────────────────

FROM node:22-alpine

WORKDIR /app

# ── 1. Install dependencies ───────────────────────────────────────────────────
# Copy manifest files first so Docker reuses this layer on code-only changes.
# package-lock.json is gitignored in this repo, so we use `npm install`.
# If you commit the lockfile in future, swap to: npm ci --omit=dev
COPY package*.json ./

RUN npm install --omit=dev \
    && npm cache clean --force

# ── 2. Copy application source ────────────────────────────────────────────────
COPY src/ ./src/

# ── 3. Create avatar upload directory ─────────────────────────────────────────
# The upload utility (src/utils/upload.js) writes files here.
# IMPORTANT: Cloud Run's filesystem is ephemeral — uploaded avatars will not
# survive container restarts or new deployments. Migrate to Cloud Storage
# (GCS) for durable avatar storage in production.
RUN mkdir -p uploads/avatars

# ── 4. Runtime environment ───────────────────────────────────────────────────
# NODE_ENV  → disables dev logging, enables production error behaviour
# PORT      → Cloud Run overrides this with an injected value (always 8080)
ENV NODE_ENV=production \
    PORT=8080

# Declare the port Cloud Run will route traffic to
EXPOSE 8080

# ── 5. Start server ──────────────────────────────────────────────────────────
# Uses SIGTERM handler defined in server.js for graceful drain + shutdown
CMD ["node", "src/server.js"]
