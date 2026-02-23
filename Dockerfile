FROM node:20-alpine

# Sharp needs these for ARM64
RUN apk add --no-cache vips-dev build-base python3

WORKDIR /app

# Install dependencies
COPY package.json ./
RUN npm install --omit=dev && npm cache clean --force

# Remove build dependencies to reduce image size
RUN apk del build-base python3

# Copy application files
COPY . .

# Create data and upload directories
RUN mkdir -p data uploads/hero uploads/portfolio uploads/gallery uploads/about uploads/thumbnails

EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "server.js"]
