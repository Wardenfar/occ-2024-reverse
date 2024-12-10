FROM oven/bun:1 AS base
COPY common /common
WORKDIR /common
RUN bun install

FROM base AS build-client
COPY client /client
WORKDIR /client

RUN bun install && bun run vite build

FROM base AS server
COPY server /server
COPY --from=build-client /client/dist /client/dist

WORKDIR /server
RUN bun install

EXPOSE 3000

CMD bun run index.ts