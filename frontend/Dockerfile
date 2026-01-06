# Frontend Dockerfile - Production Build
# Multi-stage build for optimal image size
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./

# Install ALL dependencies (dev dependencies needed for Vite build)
RUN npm ci

# Copy source files (context is project root)
# Include all frontend-related files
COPY index.html ./
COPY index.tsx ./
COPY App.tsx ./
COPY index.css ./
COPY vite.config.ts ./
COPY tsconfig.json ./
COPY tailwind.config.js ./
COPY postcss.config.js ./
COPY types.ts ./
COPY components/ ./components/
COPY features/ ./features/
COPY services/ ./services/
COPY store/ ./store/

# Build the application
# Vite will output to /app/dist by default
RUN npm run build && ls -la dist/

# ===== Production Stage =====
FROM nginx:alpine

# Install wget for healthcheck
RUN apk add --no-cache wget

# Copy custom nginx configuration
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built static files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Verify files were copied
RUN ls -la /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Run nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
