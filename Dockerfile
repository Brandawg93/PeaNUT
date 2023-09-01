FROM node:18-alpine

ENV NUT_HOST=localhost
ENV NUT_PORT=3493
ENV WEB_PORT=8080

WORKDIR /app

COPY . .

RUN npm ci && npm i typescript -g && cd client && npm ci
ENV NODE_ENV=production
RUN npm run build

EXPOSE 8080

CMD ["node", "./dist/server.js"]