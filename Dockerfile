FROM node:10-alpine
RUN mkdir -p /home/node/fec-proxy/node_modules && chown -R node:node /home/node/fec-proxy
WORKDIR /home/node/fec-proxy
COPY package*.json ./
RUN apk add --no-cache git openssh
USER node
RUN npm install --only=production
COPY --chown=node:node ./ .
# RUN npm run build
EXPOSE 8989
CMD ["node", "server/index.js"]