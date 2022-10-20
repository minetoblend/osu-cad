FROM node:alpine AS node-builder

WORKDIR /backend/common

ADD common ./

WORKDIR /backend/server

ADD gameserver/package*.json ./
RUN npm install

ADD gameserver ./
RUN npm run build

FROM registry.heroiclabs.com/heroiclabs/nakama:3.13.1

COPY --from=node-builder /backend/server/build/*.js /nakama/data/modules/build/
COPY local.yml /nakama/data/