# ============================================
# FRONTEND DOCKERFILE - React Application
# ============================================
# Multi-stage build: Build stage + Runtime stage
# This reduces final image size significantly

# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install && \
    npm cache clean --force

# Copy source code
COPY . ./

# Build React app (creates optimized build/)
RUN npm run build

# Stage 2: Runtime (serve the built app)
FROM node:18-alpine

WORKDIR /app

# Install serve to run the React build
RUN npm install -g serve

# Copy built app from builder stage
COPY --from=builder /app/build ./build

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3000 || exit 1

# Start the application
CMD ["serve", "-s", "build", "-l", "3000"]
