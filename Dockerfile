FROM node:20-alpine as build

WORKDIR /app

COPY --link . .

RUN npm ci && \
    npm i typescript -g && \
    cd client && \
    npm ci
RUN npm run build

FROM node:20-alpine

COPY --link --from=build /app/dist /dist
COPY --link --from=build /app/client/build /client/build
COPY --link --from=build /app/package.json /app/package-lock.json /app/LICENSE /app/README.md ./

ENV NODE_ENV=production
ENV NUT_HOST=localhost
ENV NUT_PORT=3493
ENV WEB_PORT=8080

RUN npm ci

EXPOSE 8080

CMD ["node", "./dist/server.js"]