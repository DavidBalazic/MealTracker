# docker build -t statistic-service .
# docker run -p 3033:3033 --name statisticsService statistic-service

# Use the official Node.js image
FROM node:16-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Expose the port
EXPOSE 3033

# Command to run the application
CMD ["npm", "start"]
