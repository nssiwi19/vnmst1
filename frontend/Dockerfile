# ── Stage 1: base ──────────────────────────────────────
FROM node:20-slim AS base
WORKDIR /app
COPY package*.json ./

# ── Stage 2: development ───────────────────────────────
FROM base AS development
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]

# ── Stage 3: build ────────────────────────────────────
FROM base AS build
RUN npm ci
COPY . .
RUN npm run build

# ── Stage 4: production ───────────────────────────────
FROM nginx:stable-alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
# Copy custom nginx config if you have one
# COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
