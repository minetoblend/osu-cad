FROM node:22-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable


FROM base AS build
COPY . /app
WORKDIR /app

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

RUN npx tsgo -b multiplayer/protocol/tsconfig.lib.json
RUN pnpm exec nx run @osucad/server-multiplayer:build --verbose

RUN pnpm deploy --filter @osucad/server-multiplayer --prod /app/deploy/server

RUN ls /app/deploy/server

FROM base as sample-data

RUN apt-get update && apt-get install wget unzip -y

WORKDIR /app/.data/sample-beatmap

RUN wget https://catboy.best/d/1900915 -O beatmap.zip
RUN unzip beatmap.zip
RUN rm beatmap.zip

EXPOSE 3000

FROM base AS app

COPY --from=build /app/deploy/server /app
COPY --from=sample-data /app/.data/sample-beatmap /app/.data/sample-beatmap
WORKDIR /app

CMD ["node", "./dist/main.js"]