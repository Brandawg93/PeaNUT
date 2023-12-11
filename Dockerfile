FROM node:20-alpine as build

WORKDIR /app

COPY --link . .

ENV PNPM_HOME=/.pnpm
ENV PATH=$PATH:$PNPM_HOME

RUN npm install -g pnpm && \
    pnpm i && \
    pnpm i typescript -g && \
    cd client && \
    pnpm i
RUN pnpm run build

FROM node:20-alpine

COPY --link --from=build /app/dist /dist
COPY --link --from=build /app/client/build /client/build
COPY --link --from=build /app/package.json /app/pnpm-lock.yaml /app/LICENSE /app/README.md ./

ENV NODE_ENV=production
ENV NUT_HOST=localhost
ENV NUT_PORT=3493
ENV WEB_PORT=8080

RUN npm install -g pnpm && pnpm i

EXPOSE 8080

CMD ["node", "./dist/server.js"]