# =============================================================================
# Stage 1: Base
# =============================================================================
FROM node:20-alpine AS base

RUN apk add --no-cache libc6-compat
WORKDIR /app

# =============================================================================
# Stage 2: Dependencies
# =============================================================================
FROM base AS deps

COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install

# =============================================================================
# Stage 3: Development - Vite dev server with HMR
# =============================================================================
FROM base AS development

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY frontend/package.json frontend/package-lock.json* ./

# Copy source (overwritten by volume mount)
COPY frontend/ ./

EXPOSE 3000

# Vite dev server with host binding for Docker
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# =============================================================================
# Stage 4: Builder - Build production assets
# =============================================================================
FROM base AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY frontend/ ./

# Build arguments for environment variables at build time
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# =============================================================================
# Stage 5: Production - Nginx static server
# =============================================================================
FROM nginx:alpine AS production

# Copy custom nginx configuration
COPY docker/frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Create non-root user
RUN addgroup -g 1001 -S nginx-app && \
    adduser -u 1001 -S nginx-app -G nginx-app && \
    chown -R nginx-app:nginx-app /usr/share/nginx/html && \
    chown -R nginx-app:nginx-app /var/cache/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nginx-app:nginx-app /var/run/nginx.pid

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
