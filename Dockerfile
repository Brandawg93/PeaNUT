FROM node:lts-slim AS pnpm

WORKDIR /app

# Set environment variables for better performance
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Install pnpm globally with better caching
RUN corepack enable

FROM pnpm AS deps

# Set environment variables for better performance
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy package files first for better layer caching
COPY --link package.json pnpm-lock.yaml* ./

# Install dependencies with better caching strategy
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm fetch --frozen-lockfile | \
    grep -v "cross-device link not permitted\|Falling back to copying packages from store"

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm i --frozen-lockfile --ignore-scripts --prefer-offline

# Build stage with optimized caching
FROM pnpm AS build

# Set environment variables for build stage
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy dependencies from deps stage
COPY --link --from=deps /app/node_modules ./node_modules/
COPY --link . /app

RUN pnpm run next-ws && \
    pnpm run build && \
    # Clean up cache to reduce image size
    rm -rf .next/standalone/.next/cache

# Production stage with minimal footprint
FROM dhi.io/node:24 AS runner

WORKDIR /

# Add labels for better image metadata
LABEL org.opencontainers.image.title="PeaNUT"
LABEL org.opencontainers.image.description="A tiny dashboard for Network UPS Tools"
LABEL org.opencontainers.image.url="https://github.com/Brandawg93/PeaNUT"
LABEL org.opencontainers.image.source='https://github.com/Brandawg93/PeaNUT'
LABEL org.opencontainers.image.licenses='Apache-2.0'

# Copy built application and set permissions to default node user
COPY --link --from=build /app/.next/standalone ./
COPY --link --from=build /app/.next/static ./.next/static
# Copy only API source files needed for Swagger documentation generation
COPY --link --from=build /app/src/app/api ./src/app/api
COPY --link --from=build /app/package.json ./package.json

# Copy and set up entrypoint script
COPY --link --chmod=755 entrypoint.js /entrypoint.js

# Set environment variables
ENV CI=true
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV WEB_HOST=0.0.0.0
ENV WEB_PORT=8080
ENV BASE_PATH=""
ENV DEBUG=false

# Switch to root user
USER 0

EXPOSE $WEB_PORT

# Optimized healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider --no-check-certificate http://${WEB_HOST}:${WEB_PORT}/api/ping || exit 1

ENTRYPOINT ["node", "/entrypoint.js"]
