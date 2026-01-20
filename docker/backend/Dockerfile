# =============================================================================
# Stage 1: Base - Common dependencies
# =============================================================================
FROM node:20-alpine AS base

# Install OpenSSL for Prisma and other build dependencies
RUN apk add --no-cache openssl libc6-compat wget

WORKDIR /app

# =============================================================================
# Stage 2: Dependencies - Install all dependencies
# =============================================================================
FROM base AS deps

# Copy package files
COPY backend/package.json backend/package-lock.json* ./

# Install all dependencies (including devDependencies for build)
RUN npm install

# =============================================================================
# Stage 3: Development - For local development with hot reload
# =============================================================================
FROM base AS development

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY backend/package.json backend/package-lock.json* ./

# Copy Prisma schema for client generation
COPY backend/prisma ./prisma

# Generate Prisma client
RUN npx prisma generate

# Copy source code (will be overwritten by volume mount in dev)
COPY backend/ ./

# Create uploads directory
RUN mkdir -p /app/uploads

# Expose ports
EXPOSE 4000 9229

# Development command with hot reload using tsx watch
CMD ["npm", "run", "dev"]

# =============================================================================
# Stage 4: Builder - Compile TypeScript
# =============================================================================
FROM base AS builder

WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY backend/package.json backend/package-lock.json* ./

# Copy Prisma schema and generate client
COPY backend/prisma ./prisma
RUN npx prisma generate

# Copy source code
COPY backend/ ./

# Build TypeScript
RUN npm run build

# =============================================================================
# Stage 5: Production - Minimal runtime image
# =============================================================================
FROM base AS production

WORKDIR /app

ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 expressjs

# Copy only production dependencies
COPY backend/package.json backend/package-lock.json* ./
RUN npm install --only=production && npm cache clean --force

# Copy Prisma schema and migrations (needed for runtime)
COPY backend/prisma ./prisma

# Generate Prisma client for production
RUN npx prisma generate

# Copy built application
COPY --from=builder /app/dist ./dist

# Create uploads directory with proper permissions
RUN mkdir -p /app/uploads && chown -R expressjs:nodejs /app/uploads

# Change ownership
RUN chown -R expressjs:nodejs /app

USER expressjs

EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:4000/health || exit 1

CMD ["node", "dist/index.js"]

# =============================================================================
# Stage 6: Worker - BullMQ worker process
# =============================================================================
FROM production AS worker

CMD ["node", "dist/worker.js"]
