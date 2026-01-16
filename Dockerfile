# ────────────────────────────────
# BASE STAGE (Ubuntu + Node)
# ────────────────────────────────
FROM node:18-bookworm AS base

# Installer dumb-init + dépendances
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
    dumb-init \
    ffmpeg \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

# Création user non-root
RUN groupadd -g 1001 nodejs \
    && useradd -m -u 1001 -g nodejs nestjs

WORKDIR /usr/src/app
COPY package*.json ./


# ────────────────────────────────
# DEVELOPMENT
# ────────────────────────────────
FROM base AS development
ENV NODE_ENV=development
RUN npm ci
COPY . .
USER nestjs
EXPOSE 3000
CMD ["npm", "run", "start:dev"]


# ────────────────────────────────
# BUILD
# ────────────────────────────────
FROM base AS build
ENV NODE_ENV=production

RUN npm ci --include=dev
COPY . .

RUN npm run build

# Clean + install prod deps
RUN rm -rf node_modules \
 && npm ci --only=production \
 && npm cache clean --force


# ────────────────────────────────
# PRODUCTION
# ────────────────────────────────
FROM node:18-bookworm AS production
ENV NODE_ENV=production

RUN apt-get update \
 && apt-get install -y --no-install-recommends \
    dumb-init \
    ffmpeg \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

RUN groupadd -g 1001 nodejs \
    && useradd -m -u 1001 -g nodejs nestjs

WORKDIR /usr/src/app

RUN mkdir -p /usr/src/app/uploads && chmod -R 777 /usr/src/app/uploads

COPY package*.json ./
RUN npm ci --only=production

COPY --from=build --chown=nestjs:nodejs /usr/src/app/dist ./dist
COPY --from=build --chown=nestjs:nodejs /usr/src/app/node_modules ./node_modules
COPY --from=build --chown=nestjs:nodejs /usr/src/app/src/i18n ./src/i18n

USER nestjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (res)=>process.exit(res.statusCode===200?0:1))"

CMD ["dumb-init", "node", "dist/main"]
