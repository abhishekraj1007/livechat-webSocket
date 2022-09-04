/**
 * const WebSocketClient = require("websocket").client;

const client = new WebSocketClient();

client.on("connectFailed", (error) => {
  console.log(`Conection error ${error.toString()}`);
});

client.on("connect", (connection) => {
  console.log(`WebSocket Client Conected !!`);

  connection.on("error", (error) =>
    console.log(`connection error ${error.toString()}`)
  );

  connection.on("message", function (message) {
    if (message.type === "utf8") {
      console.log(`Received : '${message.utf8Data}'`);
    }
  });

  function sendNumber() {
    if (connection.connected) {
      const num = Math.floor(Math.random() * 1000);
      connection.sendUTF(num.toString());
      setTimeout(sendNumber, 2000);
    }
  }

  sendNumber();
});

client.connect("ws://localhost:8080/", "echo-protocol");
 */

var ws = new WebSocket("ws://localhost:8080/");

ws.onmessage = (message) => console.log(message.data);
ws.send("Hey, I am awesome !!");
