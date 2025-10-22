/* eslint-disable no-empty */
import { useEffect, useRef, useState } from "react";
import { authService } from "../services";

export function useTaskWebSocket(taskId) {
  const wsRef = useRef(null);
  const [events, setEvents] = useState([]);

  const closeWebSocket = () => {
    try { wsRef.current?.close(); } catch {}
    wsRef.current = null;
  };

  useEffect(() => {
    if (!taskId) return;

    const accessToken = authService.getTokens().access_token;
    const wsUrl = `ws://localhost:8080/ws/subscribe?task_id=${taskId}&access_token=${accessToken}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setEvents((prev) => [...prev, data]);
      } catch (e) {
        console.error("Ошибка разбора события WebSocket:", e, event.data);
      }
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
      setEvents((prev) => [...prev, { type: "error", message: "Ошибка WebSocket" }]);
    };

    ws.onclose = () => {
      wsRef.current = null;
      setEvents((prev) => [...prev, { type: "info", message: "WebSocket закрыт" }]);
    };

    return () => {
      closeWebSocket();
    };
  }, [taskId]);

  return { events, closeWebSocket };
}