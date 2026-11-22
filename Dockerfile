FROM node:24-alpine
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci --omit=dev
COPY server ./
COPY public ../public
ENV NODE_ENV=production PORT=8089 JOSPAR_MODE=local
EXPOSE 8089
USER node
CMD ["node", "index.js"]
