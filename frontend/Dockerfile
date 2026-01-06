# ========== Build Stage ==========
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source files
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

# Build for production
RUN npm run build

# ========== Production Stage ==========
FROM nginx:alpine

# Install wget for healthcheck
RUN apk add --no-cache wget

# Remove default Nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom Nginx configuration
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copy Vite build output
COPY --from=builder /app/dist /usr/share/nginx/html

# Verify files copied
RUN ls -la /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Run Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
