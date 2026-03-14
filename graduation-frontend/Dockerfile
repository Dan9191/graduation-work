FROM node:20-alpine AS builder
WORKDIR /app

# Убираем graduation-frontend/ из путей, так как контекст уже внутри этой папки
COPY package*.json ./
RUN npm ci

# Копируем все файлы из текущей директории (graduation-frontend)
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80