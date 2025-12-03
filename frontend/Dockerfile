# Build stage
FROM node:25-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install --include=dev

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 8081
CMD ["nginx", "-g", "daemon off;"]