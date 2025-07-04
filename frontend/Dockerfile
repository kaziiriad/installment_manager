# Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Configure npm for better network handling
RUN npm config set fetch-timeout 300000 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-retries 5 && \
    npm config set registry https://registry.npmjs.org/

# Copy package files
COPY package*.json ./

# Install dependencies with increased timeout
RUN npm ci --maxsockets 5 --fetch-timeout=300000 || \
    (npm cache clean --force && npm ci --maxsockets 5 --fetch-timeout=300000)

# Copy source code
COPY . .

# Set build-time variables
ARG VITE_API_URL=http://localhost:8000
ENV VITE_API_URL=$VITE_API_URL

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]