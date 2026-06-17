FROM node:24 AS build
ENV CYPRESS_INSTALL_BINARY=0

WORKDIR /app

RUN npm install -g corepack@latest && corepack enable pnpm

COPY ./package.json ./pnpm-workspace.yaml ./
COPY client/package.json ./client/
COPY server/package.json ./server/
COPY pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY client ./client/
COPY server ./server/

RUN pnpm run --recursive build

FROM node:24
ENV NODE_ENV=production

WORKDIR /app

RUN npm install -g corepack@latest && corepack enable pnpm

COPY ./package.json ./pnpm-workspace.yaml ./
COPY server/package.json ./server/
COPY pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile --prod

USER node

COPY --chown=node --from=build /app/client/build ./client/build
COPY --chown=node --from=build /app/server/build ./server/build

EXPOSE 9000

CMD [ "node", "server/build/server/index.js" ]
