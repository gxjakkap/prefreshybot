FROM oven/bun:latest AS builder
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .

RUN bun scripts/generate-commands-manifest.ts

RUN bun build \
    --minify-whitespace --minify-syntax \
    --target bun \
    --outfile bot.js \
    src/index.ts

RUN bun build \
    --minify-whitespace --minify-syntax \
    --target bun \
    --outfile deploy.js \
    src/deploy-commands.ts

FROM oven/bun:latest AS runner
WORKDIR /app

RUN groupadd --system --gid 1001 bunuser \
    && useradd --system --uid 1001 --gid bunuser --create-home bunuser \
    && mkdir -p /home/bunuser \
    && chown bunuser:bunuser /home/bunuser

COPY --from=builder --chown=bunuser:bunuser /app/package.json ./package.json
COPY --from=builder --chown=bunuser:bunuser /app/bun.lock ./bun.lock
COPY --from=builder --chown=bunuser:bunuser /app/node_modules ./node_modules
COPY --from=builder --chown=bunuser:bunuser /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder --chown=bunuser:bunuser /app/drizzle ./drizzle
COPY --from=builder --chown=bunuser:bunuser /app/bot.js ./bot.js
COPY --from=builder --chown=bunuser:bunuser /app/deploy.js ./deploy.js

USER bunuser

CMD ["sh", "-c", "bun deploy.js && bun drizzle-kit migrate && bun bot.js"]