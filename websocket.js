require("dotenv").config();
const WebSocketServer = require("websocket").server;
const http = require("http");
const log = console.log;
const redis = require("redis");

const APP_ID = process.env.APP_ID;

const connections = new Array();

const subscriber = redis.createClient({
  port: 6379,
  host: "rds",
});

const publisher = redis.createClient({
  port: 6379,
  host: "rds",
});

subscriber.on("subscribe", function (channel, count) {
  log(`SERVER ${APP_ID} SUBSCRIBED SUCCESSFULLY TO LIVECHAT`);
  publisher.publish("livechat", `hello from server ${APP_ID}`);
});

subscriber.on("message", (channel, message) => {
  try {
    log(
      `Server ${APP_ID} recieved a message in channel ${channel} msg: ${message}`
    );

    connections.forEach((c) => c.send(`${APP_ID} : ${message}`));
  } catch (error) {
    console.error(error);
  }
});

subscriber.subscribe("livechat");

const PORT = process.env.PORT || 8080;

const server = http.createServer(function (req, res) {
  console.log(`${new Date()} Received request for ${req.url}`);
  res.writeHead(200);
  res.end();
});

server.listen(PORT, () =>
  console.log(`Server ${APP_ID} is listening on ${PORT}`)
);

const wsServer = new WebSocketServer({
  httpServer: server,
  autoAcceptConnections: false,
});

function originIsAllowed(origin) {
  return true;
}

wsServer.on("request", (req) => {
  if (!originIsAllowed(req.origin)) {
    req.reject();
    console.log(`request from ${req.origin} got rejected !!`);
    return;
  }

  const connection = req.accept(null, req.origin);
  connection.on("open", () => console.log("[Connection accepted :)]"));

  connection.on("message", (message) => {
    if (message.type === "utf8") {
      log(`Recieved message: ${message.utf8Data}`);
      connection.sendUTF(
        `SERVER ${APP_ID} : got your message  
        <span style="color : red; font-weight : 800;">${message.utf8Data}</span>`
      );

      publisher.publish("livechat", message.utf8Data);
    } else if (message.type === "binary") {
      log(`Received binary message of ${message.binaryData.length} bytes`);

      connection.sendBytes(message.binaryData);
    }
  });

  connection.on("close", function (reasonCode, description) {
    console.log(reasonCode, description);
    log(new Date() + " Peer " + connection.remoteAddress + " disconnected.");
  });

  setTimeout(
    () => connection.send(`connected successfull to server ${APP_ID}`),
    5000
  );

  connections.push(connection);
});
