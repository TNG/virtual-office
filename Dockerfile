FROM node:12 as build

WORKDIR /app

COPY client/package*.json ./client/
COPY server/package*.json ./server/
RUN cd client && npm ci
RUN cd server && npm ci

COPY client ./client/
COPY server ./server/

RUN cd client && npm run build
RUN cd server && npm run build

FROM node:12

WORKDIR /app

COPY server/package*.json ./server/
RUN cd server && npm ci --only=production

USER node

COPY --chown=node --from=build /app/client/build ./client/build
COPY --chown=node --from=build /app/server/build ./server/build

EXPOSE 9000

CMD [ "node", "server/build/server/index.js" ]
