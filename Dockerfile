# Multi-stage build for optimized production image
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx-docker.conf /etc/nginx/conf.d/default.conf

# Create nginx user and set permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# Expose port
EXPOSE 80

# Labels for better metadata
LABEL org.opencontainers.image.title="GatewayPro Dashboard"
LABEL org.opencontainers.image.description="Modern VPN/Gateway Management Dashboard"
LABEL org.opencontainers.image.vendor="GatewayPro"
LABEL org.opencontainers.image.version="1.0.0"

# Start nginx
CMD ["nginx", "-g", "daemon off;"]