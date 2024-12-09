# Base image 
FROM node:22 AS base
WORKDIR /app
COPY package*.json ./
RUN npm install

# Development Stage
FROM base AS development
EXPOSE 3000
CMD ["npm", "start"]

# Production Stage
FROM base AS production
COPY . .
RUN npm run build
RUN npm install -g serve
CMD ["serve", "-s", "build", "-l", "80"]
