import express from "express";
import "dotenv/config";
import { WebSocket, WebSocketServer } from "ws";
import { createConnection } from "./pubSubConnection";

const app = express();
const port = Number(process.env.PORT || 5000);
const topicPattern = /^[a-z][a-z0-9_-]*:[A-Z0-9_-]+(?::[a-zA-Z0-9_-]+)?$/;
app.get("/health", (_request, response) => response.json({ status: "ok" }));

async function startWebSocketServer() {
  const broker = await createConnection();
  const server = app.listen(port, () => {
    console.log(`WebSocket server listening on :${port}`);
  });
  const webSocketServer = new WebSocketServer({ server, maxPayload: 16 * 1024 });
  const clientsByTopic = new Map<string, Set<WebSocket>>();
  const brokerSubscriptions = new Set<string>();

  function send(ws: WebSocket, payload: unknown) {
    if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(payload));
  }

  async function removeSubscription(ws: WebSocket, topic: string) {
    const clients = clientsByTopic.get(topic);
    if (!clients) return;
    clients.delete(ws);
    if (clients.size > 0) return;

    clientsByTopic.delete(topic);
    if (brokerSubscriptions.delete(topic)) {
      try {
        await broker.unsubscribeToBroker(topic);
      } catch (error) {
        console.error(`Failed to unsubscribe from ${topic}`, error);
      }
    }
  }

  webSocketServer.on("connection", (ws) => {
    const subscriptions = new Set<string>();
    let alive = true;
    ws.on("pong", () => { alive = true; });

    ws.on("message", async (rawMessage) => {
      let parsedMessage: unknown;
      try {
        parsedMessage = JSON.parse(rawMessage.toString());
      } catch {
        send(ws, { type: "error", message: "Message must be valid JSON." });
        return;
      }

      if (!parsedMessage || typeof parsedMessage !== "object") {
        send(ws, { type: "error", message: "Message must be an object." });
        return;
      }
      const message = parsedMessage as { type?: unknown; topic?: unknown };
      if (message.type !== "subscribe" && message.type !== "unsubscribe") {
        send(ws, { type: "error", message: "Expected subscribe or unsubscribe." });
        return;
      }

      if (typeof message.topic !== "string" || !topicPattern.test(message.topic)) {
        send(ws, { type: "error", message: "Invalid topic." });
        return;
      }

      const { topic } = message;
      if (message.type === "subscribe") {
        if (subscriptions.has(topic)) {
          send(ws, { type: "subscribed", topic });
          return;
        }

        subscriptions.add(topic);
        const clients = clientsByTopic.get(topic) ?? new Set<WebSocket>();
        clients.add(ws);
        clientsByTopic.set(topic, clients);

        if (!brokerSubscriptions.has(topic)) {
          brokerSubscriptions.add(topic);
          try {
            await broker.subscribeToBroker(topic, (payload) => {
              let data: unknown = payload;
              try { data = JSON.parse(payload); } catch { /* keep plain text payloads */ }
              for (const client of clientsByTopic.get(topic) ?? []) {
                send(client, { type: "data", topic, data });
              }
            });
          } catch (error) {
            brokerSubscriptions.delete(topic);
            await removeSubscription(ws, topic);
            send(ws, { type: "error", topic, message: "Could not subscribe to topic." });
            console.error(`Failed to subscribe to ${topic}`, error);
            return;
          }
        }

        try {
          await broker.publishToBroker("snapshot:REQUEST", JSON.stringify({ topic }));
        } catch (error) {
          console.error(`Could not request snapshot for ${topic}`, error);
        }

        send(ws, { type: "subscribed", topic });
      } else if (message.type === "unsubscribe") {
        subscriptions.delete(topic);
        await removeSubscription(ws, topic);
        send(ws, { type: "unsubscribed", topic });
      }
    });

    ws.on("close", () => {
      for (const topic of subscriptions) void removeSubscription(ws, topic);
      subscriptions.clear();
    });
    ws.on("error", (error) => console.error("WebSocket client error", error));
    send(ws, { type: "connected" });

    // Heartbeats let the server clean up dead clients and their Redis subscriptions.
    const heartbeat = setInterval(() => {
      if (!alive) {
        ws.terminate();
        clearInterval(heartbeat);
        return;
      }
      alive = false;
      ws.ping();
    }, 30_000);
    ws.on("close", () => clearInterval(heartbeat));
  });

  webSocketServer.on("error", (error) => console.error("WebSocket server error", error));
}

void startWebSocketServer().catch((error) => {
  console.error("Could not start WebSocket server", error);
  process.exitCode = 1;
});
