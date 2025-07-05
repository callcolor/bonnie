FROM node:18.20.8

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Install TypeScript globally
RUN npm install -g typescript

# Compile TypeScript files
RUN npx prisma db push
RUN tsc

# Command to run the application
CMD ["node", "dist/bonnie.js"]
