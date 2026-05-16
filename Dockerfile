# ── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Install deps first (cached layer)
COPY package*.json ./
RUN npm ci

# Copy source and compile
COPY . .
RUN npm run build
# npm run build = tsc && copyfiles -u 1 "src/**/*.ejs" dist
# EJS templates are copied into dist/ by the build script above

# ── Stage 2: Production ──────────────────────────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app

ENV NODE_ENV=production

# Only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled output from builder
COPY --from=builder /app/dist ./dist

EXPOSE 5000

CMD ["node", "dist/server.js"]
