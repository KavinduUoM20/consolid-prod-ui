# Build stage
FROM node:18-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_SUPABASE_SERVICE_ROLE_KEY
ARG VITE_APP_API_URL
ARG VITE_APP_NAME
ARG VITE_APP_VERSION
ARG VITE_APP_BASE_LAYOUT_CONFIG_KEY
ARG VITE_APP_THEME_NAME

ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_SUPABASE_SERVICE_ROLE_KEY=$VITE_SUPABASE_SERVICE_ROLE_KEY
ENV VITE_APP_API_URL=$VITE_APP_API_URL
ENV VITE_APP_NAME=$VITE_APP_NAME
ENV VITE_APP_VERSION=$VITE_APP_VERSION
ENV VITE_APP_BASE_LAYOUT_CONFIG_KEY=$VITE_APP_BASE_LAYOUT_CONFIG_KEY
ENV VITE_APP_THEME_NAME=$VITE_APP_THEME_NAME

# Copy source code
COPY . .

# Copy environment file if it exists
COPY .env* ./

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration (optional)
# COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 