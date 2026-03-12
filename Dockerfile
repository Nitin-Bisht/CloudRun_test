# ─────────────────────────────────────────────────────────────
# Stage 1: Install dependencies
# ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

# Copy package files from the web/ subfolder
COPY web/package*.json ./

# Install all dependencies (including devDeps needed for build)
RUN npm ci

# ─────────────────────────────────────────────────────────────
# Stage 2: Build the Next.js app
# ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy installed node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy the entire web/ folder contents
COPY web/ ./

# Next.js reads NEXT_PUBLIC_* vars at BUILD time.
# Uncomment and pass these as --build-arg when running docker build:
# ARG NEXT_PUBLIC_SUPABASE_URL
# ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
# ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
# ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

RUN npm run build

# ─────────────────────────────────────────────────────────────
# Stage 3: Production runtime (lean image)
# ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy only what Next.js needs to run (standalone output)
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

RUN chown -R nextjs:nodejs /app

USER nextjs

# Cloud Run injects $PORT at runtime (default 8080)
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

EXPOSE 8080

CMD ["node", "server.js"]
