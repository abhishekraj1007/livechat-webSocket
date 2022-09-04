FROM node:alpine

WORKDIR /web-socket

ADD package*.json ./

RUN npm install

ADD . .

CMD ["node", "websocket.js"]