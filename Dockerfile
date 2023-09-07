FROM node:18-alpine as build

ENV NUT_HOST=localhost
ENV NUT_PORT=3493
ENV WEB_PORT=8080

WORKDIR /app

COPY . .

RUN npm ci && npm i typescript -g && cd client && npm ci
RUN npm run build

FROM node:18-alpine

COPY --from=build /app/dist /dist
COPY --from=build /app/client/build /client/build
COPY --from=build /app/package.json /package.json
COPY --from=build /app/package-lock.json /package-lock.json
COPY --from=build /app/LICENSE /LICENSE
COPY --from=build /app/README.md /README.md

ENV NODE_ENV=production

RUN npm ci

EXPOSE 8080

CMD ["node", "./dist/server.js"]