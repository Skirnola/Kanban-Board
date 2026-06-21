FROM node:22-alpine AS build

WORKDIR /app

ARG VITE_AUTH_API_URL=http://localhost:4000
ARG VITE_TASK_API_URL=http://localhost:5000
ENV VITE_AUTH_API_URL=$VITE_AUTH_API_URL
ENV VITE_TASK_API_URL=$VITE_TASK_API_URL

COPY package*.json ./
RUN npm install

COPY index.html vite.config.js ./
COPY public ./public
COPY src ./src

RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
