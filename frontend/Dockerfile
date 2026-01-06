# Frontend Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies needed for build)
# Don't set NODE_ENV=production yet as it would skip devDependencies
RUN npm ci

# Copy all source files and configs needed for build
COPY . .

# Verify critical files exist
RUN ls -la && \
    test -f vite.config.ts && \
    test -f tsconfig.json && \
    test -f index.html && \
    echo "All required files present"

# Build for production (increase Node memory limit if needed)
ENV NODE_ENV=production
ENV NODE_OPTIONS=--max_old_space_size=2048
RUN npm run build

# Production stage with nginx
FROM nginx:alpine

# Copy custom nginx config
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
