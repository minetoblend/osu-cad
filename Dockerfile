FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run -r build
RUN pnpm deploy --filter "@osucad/server" --prod /prod/server
RUN pnpm deploy --filter "@osucad/client" --prod /prod/client

FROM base AS server
COPY --from=build /prod/server /prod/server
WORKDIR /prod/server

ENV NODE_ENV=production

EXPOSE 3000
CMD [ "pnpm", "start:prod" ]

FROM base AS client-ssr
COPY --from=build /prod/client /prod/client
WORKDIR /prod/client

ENV NODE_ENV=production

EXPOSE 5173
CMD [ "pnpm", "start" ]
