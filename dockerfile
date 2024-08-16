FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./

RUN npm install

COPY . .

# Build
RUN npm run build

# Start
EXPOSE 3000
CMD ["npm", "start"]
