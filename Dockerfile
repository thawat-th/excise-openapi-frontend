## Build stage
#FROM node:18-alpine AS builder
#
#WORKDIR /app
#
## Install dependencies
#COPY package*.json ./
#RUN npm ci
#
## Build args for NEXT_PUBLIC_* env vars (must match docker-compose args)
#ARG NEXT_PUBLIC_API_GATEWAY_URL
#ARG NEXT_PUBLIC_HYDRA_URL
#ARG NEXT_PUBLIC_IDENTITY_URL
#ARG NEXT_PUBLIC_AUTH_SERVER_PUBLIC_URL
#ARG NEXT_PUBLIC_OAUTH_CLIENT_ID
#ARG NEXT_PUBLIC_OAUTH_REDIRECT_URI
#
## Convert ARG to ENV (required for Next.js build)
#ENV NEXT_PUBLIC_API_GATEWAY_URL=$NEXT_PUBLIC_API_GATEWAY_URL
#ENV NEXT_PUBLIC_HYDRA_URL=$NEXT_PUBLIC_HYDRA_URL
#ENV NEXT_PUBLIC_IDENTITY_URL=$NEXT_PUBLIC_IDENTITY_URL
#ENV NEXT_PUBLIC_AUTH_SERVER_PUBLIC_URL=$NEXT_PUBLIC_AUTH_SERVER_PUBLIC_URL
#ENV NEXT_PUBLIC_OAUTH_CLIENT_ID=$NEXT_PUBLIC_OAUTH_CLIENT_ID
#ENV NEXT_PUBLIC_OAUTH_REDIRECT_URI=$NEXT_PUBLIC_OAUTH_REDIRECT_URI
#
## Copy source and build
#COPY . .
#RUN npm run build
#
## Production stage
#FROM node:18-alpine AS runner
#
#WORKDIR /app
#
#ENV NODE_ENV=production
#
## Copy only necessary files
#COPY --from=builder /app/package*.json ./
#COPY --from=builder /app/.next ./.next
#COPY --from=builder /app/public ./public
#COPY --from=builder /app/node_modules ./node_modules
#
## Create non-root user
#RUN addgroup --system --gid 1001 nodejs && \
#    adduser --system --uid 1001 nextjs && \
#    chown -R nextjs:nodejs /app
#
#USER nextjs
#
#EXPOSE 3000
#
#CMD ["npm", "start"]
# Development Dockerfile - lightweight for local dev
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install && npm cache clean --force

# Copy source (will be overridden by volume mount)
COPY . .

# Expose port
EXPOSE 3000

# Run dev server with hot reload
CMD ["npm", "run", "dev"]
