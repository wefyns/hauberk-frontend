/* eslint-disable no-empty */
import { useEffect, useRef, useState, useCallback } from "react";
import { authService } from "../services";

export function useTaskWebSocket(taskId) {
  const wsRef = useRef(null);
  const retryTimerRef = useRef(null);
  const retryCountRef = useRef(0);
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState("idle");
  const MAX_RETRIES = 6;

  const accessToken = authService.getTokens?.().access_token;

  const closeWebSocket = useCallback((intentional = true) => {
    try {
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
      if (wsRef.current) {
        try {
          wsRef.current.close(1000, intentional ? "client-closed" : "client-request");
        } catch {}
      }
    } catch {}
    wsRef.current = null;
    retryCountRef.current = 0;
    setStatus("closed");
  }, []);

  useEffect(() => {
    if (!taskId) {
      closeWebSocket(true);
      return;
    }

    if (!accessToken) {
      setEvents((prev) => [
        ...prev,
        { type: "error", message: "No access token available for WebSocket connection" },
      ]);
      setStatus("error");
      return;
    }

    const protocol = import.meta.env.VITE_API_PROTOCOL || "https";
    const host = import.meta.env.VITE_API_HOST || "localhost";
    const scheme = protocol === "https" ? "wss" : "ws";
    const hostPart = `${host}:8080`;

    const safeTaskId = encodeURIComponent(taskId);
    const safeToken = encodeURIComponent(accessToken);

    const wsUrl = `${scheme}://${hostPart}/ws/subscribe?task_id=${safeTaskId}&access_token=${safeToken}`;

    if (wsRef.current) {
      try {
        wsRef.current.close(1000, "reconnect");
      } catch {}
      wsRef.current = null;
    }

    let ws;
    let manuallyClosed = false;

    const connect = () => {
      setStatus("connecting");
      try {
        ws = new WebSocket(wsUrl);
        wsRef.current = ws;
      } catch (err) {
        setEvents((prev) => [...prev, { type: "error", message: "WebSocket constructor error", err }]);
        setStatus("error");
        scheduleReconnect();
        return;
      }

      ws.onopen = () => {
        retryCountRef.current = 0;
        setStatus("open");
        setEvents((prev) => [...prev, { type: "info", message: "WebSocket opened" }]);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setEvents((prev) => [...prev, data]);
        } catch (e) {
          console.error("Ошибка разбора события WebSocket:", e, event.data);
          setEvents((prev) => [...prev, { type: "error", message: "Ошибка разбора события WebSocket" }]);
        }
      };

      ws.onerror = (err) => {
        console.error("WebSocket error:", err);
        setStatus("error");
        setEvents((prev) => [...prev, { type: "error", message: "WebSocket error", err }]);
      };

      ws.onclose = (ev) => {
        wsRef.current = null;
        const { code, reason, wasClean } = ev;
        setEvents((prev) => [
          ...prev,
          { type: "info", message: `WebSocket closed (code=${code}, reason=${reason}, clean=${wasClean})` },
        ]);

        if (manuallyClosed || code === 1000) {
          setStatus("closed");
          return;
        }

        scheduleReconnect();
      };
    };

    const scheduleReconnect = () => {
      retryCountRef.current = (retryCountRef.current || 0) + 1;
      if (retryCountRef.current > MAX_RETRIES) {
        setEvents((prev) => [...prev, { type: "error", message: "Max WS reconnect attempts reached" }]);
        setStatus("closed");
        return;
      }
      const delay = Math.min(30000, 1000 * 2 ** (retryCountRef.current - 1));
      setEvents((prev) => [...prev, { type: "info", message: `Reconnecting in ${delay}ms (attempt ${retryCountRef.current})` }]);
      retryTimerRef.current = setTimeout(() => {
        connect();
      }, delay);
    };

    connect();

    return () => {
      manuallyClosed = true;
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
      }
      try {
        if (wsRef.current) wsRef.current.close(1000, "component-unmount");
      } catch {}
      wsRef.current = null;
    };
  }, [taskId, accessToken, closeWebSocket]);

  const sendMessage = useCallback((payload) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket is not open");
    }
    const str = typeof payload === "string" ? payload : JSON.stringify(payload);
    wsRef.current.send(str);
  }, []);

  return {
    events,
    status,
    closeWebSocket: () => closeWebSocket(true),
    sendMessage,
    wsRef,
  };
}
