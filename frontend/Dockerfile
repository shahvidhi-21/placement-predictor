# ─── Stage 1: Build the React app ───────────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files first for better layer caching
COPY package.json package-lock.json ./

# Use --legacy-peer-deps because react-scripts 5 has peer dep conflicts with React 19
RUN npm install --legacy-peer-deps

# Copy all source code
COPY . .

# Fix OpenSSL compatibility issue between react-scripts 5 and Node 18+
ENV NODE_OPTIONS=--openssl-legacy-provider

# Build the optimized production bundle
RUN npm run build

# ─── Stage 2: Serve with Nginx (lightweight, no Node.js in final image) ──────
FROM nginx:alpine

# Copy the built React files into Nginx's web folder
COPY --from=build /app/build /usr/share/nginx/html

# Use custom nginx config (SPA routing + API proxy)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 (Nginx default)
EXPOSE 80

# Start Nginx in the foreground (required for Docker)
CMD ["nginx", "-g", "daemon off;"]
