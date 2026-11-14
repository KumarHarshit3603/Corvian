"use client";

import { useEffect, useState } from "react";

export function marketTopic(symbol, stream, timeframe) {
  const normalizedSymbol = symbol.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  return timeframe
    ? `${stream}:${normalizedSymbol}:${timeframe}`
    : `${stream}:${normalizedSymbol}`;
}

export default function useMarketSocket(topics) {
  const topicsKey = JSON.stringify(topics);
  const [data, setData] = useState({});
  const [status, setStatus] = useState("connecting");

  useEffect(() => {
    const subscribedTopics = JSON.parse(topicsKey);
    const socketUrl = process.env.NEXT_PUBLIC_MARKET_WS_URL || "ws://localhost:5000";
    let socket;
    let reconnectTimer;
    let reconnectDelay = 500;
    let stopped = false;

    setData({});
    setStatus("connecting");

    const connect = () => {
      if (stopped) return;
      socket = new WebSocket(socketUrl);

      socket.addEventListener("open", () => {
        reconnectDelay = 500;
        setStatus("connected");
        for (const topic of subscribedTopics) {
          socket.send(JSON.stringify({ type: "subscribe", topic }));
        }
      });

      socket.addEventListener("message", (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === "data" && typeof message.topic === "string") {
            setData((current) => {
              const previous = current[message.topic];
              let nextValue = message.data;
              if (message.topic.startsWith("trades:")) {
                nextValue = message.data?.type === "snapshot" && Array.isArray(message.data.trades)
                  ? message.data.trades.slice(0, 50)
                  : [message.data, ...(Array.isArray(previous) ? previous : [])].slice(0, 50);
              } else if (message.topic.startsWith("chart:") && message.data?.type !== "snapshot") {
                nextValue = { ...previous, candle: message.data?.candle };
              }
              return { ...current, [message.topic]: nextValue };
            });
          } else if (message.type === "error") {
            console.error("Market stream error:", message.message);
          }
        } catch (error) {
          console.error("Could not read market stream message", error);
        }
      });

      socket.addEventListener("close", () => {
        if (stopped) return;
        setStatus("reconnecting");
        reconnectTimer = window.setTimeout(connect, reconnectDelay);
        reconnectDelay = Math.min(reconnectDelay * 2, 10_000);
      });

      socket.addEventListener("error", () => socket.close());
    };

    connect();
    return () => {
      stopped = true;
      window.clearTimeout(reconnectTimer);
      if (socket?.readyState === WebSocket.OPEN) {
        for (const topic of subscribedTopics) {
          socket.send(JSON.stringify({ type: "unsubscribe", topic }));
        }
      }
      socket?.close();
    };
  }, [topicsKey]);

  return { data, status };
}
