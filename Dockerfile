FROM node:lts-slim AS deps

WORKDIR /app

# Set environment variables for better performance
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Install pnpm globally with better caching
RUN npm i -g corepack && \
    corepack enable pnpm

# Copy package files first for better layer caching
COPY --link package.json pnpm-lock.yaml* ./

# Install dependencies with better caching strategy
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm fetch --frozen-lockfile | \
    grep -v "cross-device link not permitted\|Falling back to copying packages from store"

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm i --frozen-lockfile --ignore-scripts --prefer-offline

# Build stage with optimized caching
FROM node:lts-slim AS build

WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy dependencies from deps stage
COPY --link --from=deps /app/node_modules ./node_modules/
COPY --link . /app
# Install build dependencies and prepare
RUN npm i -g corepack && \
    corepack enable pnpm

RUN pnpm run prepare && \
    if [ "$(uname -m)" = "armv7l" ]; then \
        echo "Building for ARMv7 architecture" && \
        pnpm run build; \
    else \
        echo "Building for default architecture with turbo" && \
        pnpm run build:turbo; \
    fi && \
    # Clean up cache to reduce image size
    rm -rf .next/standalone/.next/cache

# Production stage with minimal footprint
FROM node:lts-alpine AS runner

# Add labels for better image metadata
LABEL org.opencontainers.image.title="PeaNUT"
LABEL org.opencontainers.image.description="A tiny dashboard for Network UPS Tools"
LABEL org.opencontainers.image.url="https://github.com/Brandawg93/PeaNUT"
LABEL org.opencontainers.image.source='https://github.com/Brandawg93/PeaNUT'
LABEL org.opencontainers.image.licenses='Apache-2.0'

# Copy built application and set permissions to default node user
COPY --link --chown=1000:1000 --from=build /app/.next/standalone ./
COPY --link --chown=1000:1000 --from=build /app/.next/static ./.next/static

# Set environment variables
ENV CI=true
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV WEB_HOST=0.0.0.0
ENV WEB_PORT=8080

# Switch to non-root user (node user is built into the image)
# USER 1000

EXPOSE $WEB_PORT

# Optimized healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider --no-check-certificate http://${WEB_HOST}:${WEB_PORT}/api/ping || exit 1

CMD ["npm", "start"]
