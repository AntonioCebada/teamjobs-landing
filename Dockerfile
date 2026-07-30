# syntax=docker/dockerfile:1.7

# Pinned scaffold toolchain: Node 22.14.0, pnpm 10.34.5, nginx 1.29.1.
FROM node:22.14.0-alpine3.21 AS base

ENV PNPM_HOME=/pnpm
ENV PATH=${PNPM_HOME}:${PATH}

WORKDIR /app

RUN \
  corepack enable \
  && corepack prepare pnpm@10.34.5 --activate \
  && node --version \
  && pnpm --version

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM deps AS test
COPY . .
CMD ["pnpm", "test"]

FROM deps AS dev
COPY . .
EXPOSE 4321
CMD ["pnpm", "dev", "--host", "0.0.0.0"]

FROM deps AS build
COPY . .
RUN pnpm build

FROM nginx:1.29.1-alpine AS prod
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
