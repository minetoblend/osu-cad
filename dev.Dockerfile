FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN apt-get update && apt-get install procps -y #needed for live reload in server

FROM base AS deps

COPY . /app
WORKDIR /app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

FROM base AS common
COPY --from=deps /app /app
WORKDIR /app

CMD pnpm --filter "@osucad/common" dev

FROM base AS client
COPY --from=deps /app /app
WORKDIR /app

CMD pnpm --filter "@osucad/client" dev

FROM base AS server
COPY --from=deps /app /app
WORKDIR /app

CMD pnpm --filter "@osucad/server" start:dev
