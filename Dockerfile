from node:lts-alpine

WORKDIR /app

COPY package.json /app
COPY packages/common/package.json /app/packages/common/package.json
COPY packages/server/package.json /app/packages/server/package.json
COPY packages/client/package.json /app/packages/client/package.json
COPY yarn.lock /app

RUN --mount=type=cache,target=/root/.yarn YARN_CACHE_FOLDER=/root/.yarn yarn --frozen-lockfile

COPY . /app

RUN yarn workspace @osucad/common build
RUN yarn workspace @osucad/server build
RUN yarn workspace @osucad/client build

RUN --mount=type=cache,target=/root/.yarn YARN_CACHE_FOLDER=/root/.yarn yarn install --production --ignore-scripts --prefer-offline

ENV NODE_ENV=production

CMD ["yarn", "workspace", "@osucad/server", "start:prod"]
