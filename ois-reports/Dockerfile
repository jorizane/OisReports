# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runtime stage
FROM node:20-alpine
WORKDIR /app
RUN npm i -g serve
COPY --from=build /app/dist/ois-reports/browser ./dist
CMD ["sh", "-c", "serve -s dist -l ${PORT:-8080}"]
