FROM node:lts-slim AS deps

WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm i -g corepack && \
    corepack enable pnpm
COPY --link package.json pnpm-lock.yaml* /app/

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm fetch | \
    grep -v "cross-device link not permitted\|Falling back to copying packages from store"

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm i --frozen-lockfile --ignore-scripts

FROM node:lts-slim AS build

WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

COPY --link --from=deps /app/node_modules ./node_modules/
COPY . /app

RUN npm -g i corepack && \
    corepack enable pnpm && \
    pnpm run build && \
    rm -rf .next/standalone/.next/cache

FROM node:lts-alpine AS runner

LABEL org.opencontainers.image.title="PeaNUT"
LABEL org.opencontainers.image.description="A tiny dashboard for Network UPS Tools"
LABEL org.opencontainers.image.url="https://github.com/Brandawg93/PeaNUT"
LABEL org.opencontainers.image.source='https://github.com/Brandawg93/PeaNUT'
LABEL org.opencontainers.image.licenses='Apache-2.0'

COPY --from=build --link /app/.next/standalone ./
COPY --from=build --link /app/.next/static ./.next/static

ENV CI=true
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV WEB_HOST=0.0.0.0
ENV WEB_PORT=8080
ENV AUTH_TRUST_HOST=http://${WEB_HOST}:${WEB_PORT}
ENV AUTH_SECRET=

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE $WEB_PORT

HEALTHCHECK --interval=10s --timeout=3s --start-period=20s \
  CMD wget --no-verbose --tries=1 --spider --no-check-certificate http://${WEB_HOST}:${WEB_PORT}/api/ping || exit 1

ENTRYPOINT ["/entrypoint.sh"]
CMD ["npm", "start"]
