FROM node:20.19.0-alpine AS build
WORKDIR /workspace/app

COPY app/package*.json ./
RUN npm ci

COPY app/ ./
RUN npm run build -- --configuration production

FROM nginx:1.27-alpine
WORKDIR /usr/share/nginx/html

COPY ops/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /workspace/app/dist/app/browser/ ./
COPY app/public/runtime-config.js ./runtime-config.js

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
