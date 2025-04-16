const http = require("http");
const WebSocket = require("ws");
const fs = require("fs");
const path = require("path");

const messagesFile = path.join(__dirname, "messages.json");

let messages = [];
if (fs.existsSync(messagesFile)) {
  messages = JSON.parse(fs.readFileSync(messagesFile));
}

const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end("Chat WebSocket backend running.");
});

const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
  // Send message history
  ws.send(JSON.stringify({ type: "init", messages }));

  ws.on("message", (msgData) => {
    const msg = JSON.parse(msgData);
    messages.push(msg);

    // Save to file
    fs.writeFileSync(messagesFile, JSON.stringify(messages, null, 2));

    // Broadcast to all clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: "new", message: msg }));
      }
    });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () =>
  console.log(`WebSocket server running on port ${PORT}`)
);
