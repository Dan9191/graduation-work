FROM node:20-alpine AS builder

WORKDIR /app
COPY . .
RUN npm ci
RUN npm run docs:build

FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/docs/.vitepress/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]