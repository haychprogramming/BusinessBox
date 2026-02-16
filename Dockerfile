# Build Stage
FROM node:20-alpine as build

WORKDIR /app

# Install dependencies (incorporating cache)
COPY package*.json ./
RUN npm ci

# Build the frontend
COPY . .
RUN npm run build

# Production Stage
FROM node:20-alpine

# Add Metadata
LABEL org.opencontainers.image.title="BusinessBox"
LABEL org.opencontainers.image.description="A premium, offline-first application for managing a small digital agency."
LABEL org.opencontainers.image.source="https://github.com/haych/businessbox"
LABEL org.opencontainers.image.authors="haych"

WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Copy necessary files
COPY --from=build /app/package*.json ./
COPY --from=build /app/server ./server
COPY --from=build /app/dist ./dist

# Install ONLY production dependencies
RUN npm ci --omit=dev

# Create data directory for persistence
RUN mkdir -p data && chown -R node:node data

# Use non-root user for security
USER node

EXPOSE 3000

CMD ["npm", "start"]
