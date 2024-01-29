ARG VARIANT="20"
FROM mcr.microsoft.com/vscode/devcontainers/typescript-node:${VARIANT}

RUN apt update && apt install nut -y

RUN npm install -g pnpm

ENV PATH="${PATH}:./node_modules/.bin"