FROM node:18.20.8

# Set the working directory
WORKDIR /usr/src/app

# Install necessary packages
RUN apt update
RUN apt install libespeak-ng1 python3-pip sox ffmpeg -y
RUN pip install mycroft-plugin-tts-mimic3[all] --break-system-packages

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
