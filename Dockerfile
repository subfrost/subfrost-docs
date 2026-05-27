# Multi-stage build: Node builds the Docusaurus static site, nginx serves it.
# Image lands in GAR at
# us-central1-docker.pkg.dev/night-wolves-jogging/subfrost-docker/docs/subfrost-docs:<TS>-<SHA>
# Flux's ImagePolicy picks the newest <TS>-<SHA> tag and bumps the HelmRelease
# in subfrost-admin.

FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

# nginx-unprivileged runs as uid 101 and listens on 8080 by default — keeps the
# pod non-root without needing CAP_NET_BIND_SERVICE for port 80.
FROM nginxinc/nginx-unprivileged:1.27-alpine AS runner
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 8080
