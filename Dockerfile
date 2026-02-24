FROM node:20-alpine

WORKDIR /app

# Install dependencies (Sharp downloads its own prebuilt libvips for ARM64)
COPY package.json ./
RUN npm install --omit=dev && npm cache clean --force

# Copy application files
COPY . .

# Create data and upload directories
RUN mkdir -p data uploads/hero uploads/portfolio uploads/gallery uploads/about uploads/page uploads/thumbnails

EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "server.js"]
