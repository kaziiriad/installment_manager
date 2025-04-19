# Use Node.js as the base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build the application for production
RUN npm run build

# Install a simple server to serve the static files
RUN npm install -g serve

# Expose the port the app will run on
EXPOSE 3000

# Command to run the application
CMD ["serve", "-s", "dist", "-l", "8080"]