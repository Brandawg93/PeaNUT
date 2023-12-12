FROM node:20-alpine as build

WORKDIR /app

ENV PNPM_HOME /.pnpm
ENV PATH $PATH:$PNPM_HOME

COPY package.json pnpm-lock.yaml ./

RUN npm -g i pnpm && pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build

FROM node:20-alpine

COPY --from=build --link /app/package.json /app/pnpm-lock.yaml /app/LICENSE /app/README.md /app/next.config.js ./
COPY --from=build --link /app/public ./public
COPY --from=build --link /app/.next/standalone ./
COPY --from=build --link /app/.next/static ./.next/static

ENV NODE_ENV production
ENV NUT_HOST localhost
ENV NUT_PORT 3493
ENV WEB_PORT 8080
ENV PORT $WEB_PORT

EXPOSE $PORT

CMD ["node", "server.js"]