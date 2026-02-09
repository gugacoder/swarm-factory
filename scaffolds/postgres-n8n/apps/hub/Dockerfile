FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
RUN npm i -g serve
WORKDIR /app
COPY --from=build /app/dist ./dist
EXPOSE 9000
CMD ["serve", "-s", "dist", "-l", "9000"]
