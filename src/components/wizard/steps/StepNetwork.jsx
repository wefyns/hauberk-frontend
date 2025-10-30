import React, { useEffect, useCallback, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { agentService } from "../../../services";
import { useTaskWebSocket } from "../../../hooks/useTaskWebSocket";
import styles from "./Steps.module.css";

export function StepNetwork({ registerSubmit, isSubmitting, orgId, agentId }) {
  const [error, setError] = useState(null);
  const [networkConnected, setNetworkConnected] = useState(false);
  const [taskId, setTaskId] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("idle");

  const { events: wsEvents, closeWebSocket } = useTaskWebSocket(taskId);

  const createConnectionMutation = useMutation({
    mutationFn: () => agentService.createConnectionDocument(parseInt(orgId), parseInt(agentId)),
    onError: (err) => {
      setError(`Ошибка создания connection document: ${err.message}`);
      setConnectionStatus("error");
    },
  });

  const connectToNetworkMutation = useMutation({
    mutationFn: (docId) => agentService.connectWithDocument(parseInt(orgId), parseInt(agentId), docId),
    onSuccess: (result) => {
      const taskIdFromResponse = result?.task_id;
      if (taskIdFromResponse) {
        setTaskId(taskIdFromResponse);
        setConnectionStatus("connecting");
      } else {
        setNetworkConnected(true);
        setConnectionStatus("connected");
      }
    },
    onError: (err) => {
      setError(`Ошибка подключения к сети: ${err.message}`);
      setConnectionStatus("error");
    },
  });

  const performNetworkConnection = useCallback(async () => {
    try {
      setError(null);
      setConnectionStatus("connecting");

      const connectionDoc = await createConnectionMutation.mutateAsync();
      const docId = connectionDoc?.id || connectionDoc?.connection_document?.id;
      
      if (!docId) {
        throw new Error("Не удалось получить ID connection document");
      }

      await connectToNetworkMutation.mutateAsync(docId);
      
      return { success: true, meta: { networkConnected: true } };
    } catch (err) {
      setConnectionStatus("error");
      return { success: false, error: err.message || "Ошибка подключения к сети" };
    }
  }, [createConnectionMutation, connectToNetworkMutation]);

  const handleWizardSubmit = useCallback(async () => {
    if (networkConnected || connectionStatus === "connected") {
      return { 
        success: true, 
        meta: { 
          networkConfigured: true,
          wizardCompleted: true 
        } 
      };
    }

    setNetworkConnected(true);
    setConnectionStatus("connected");
    
    return { 
      success: true, 
      meta: { 
        networkConfigured: true,
        wizardCompleted: true 
      } 
    };
  }, [networkConnected, connectionStatus]);

  useEffect(() => {
    if (orgId && agentId) {
      registerSubmit(handleWizardSubmit);
    }
  }, [registerSubmit, handleWizardSubmit, orgId, agentId]);

  useEffect(() => {
    if (wsEvents.length > 0) {
      const lastEvent = wsEvents[wsEvents.length - 1];
      if (lastEvent.type === "success" || 
          (lastEvent.type === "event" && lastEvent.payload?.status === "completed")) {
        setNetworkConnected(true);
        setConnectionStatus("connected");
        closeWebSocket();
      } else if (lastEvent.type === "error") {
        setConnectionStatus("error");
        setError(lastEvent.message || "Ошибка подключения к сети");
        closeWebSocket();
      }
    }
  }, [wsEvents, closeWebSocket]);

  useEffect(() => {
    return () => {
      closeWebSocket();
    };
  }, [closeWebSocket]);

  if (!orgId || !agentId) {
    return (
      <div className={styles.stepContainer}>
        <div className={styles.stepContent}>
          <div className={styles.errorMessage}>
            Ошибка: Необходимо создать организацию и агента для подключения к сети
          </div>
        </div>
      </div>
    );
  }

  if (networkConnected || connectionStatus === "connected") {
    return (
      <div className={styles.stepContainer}>
        <div className={styles.stepContent}>
          <div className={styles.successState}>
            <h3 className={styles.successTitle}>Сеть готова к работе!</h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.stepContainer}>
      <div className={styles.stepContent}>
        <h2 className={styles.stepTitle}>Завершение настройки сети</h2>

        {error && (
          <div className={styles.errorMessage}>
            <p>{error}</p>
          </div>
        )}

        <div style={{ 
          border: "1px solid #e5e7eb", 
          borderRadius: "8px", 
          padding: "20px",
          marginBottom: "24px",
          background: "#fafafa"
        }}>
          <h4 style={{ margin: "0 0 16px 0", color: "#374151" }}>Статус настройки сети</h4>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                backgroundColor: connectionStatus === "connected" ? "#10b981" : 
                                connectionStatus === "connecting" ? "#f59e0b" : 
                                connectionStatus === "error" ? "#ef4444" : "#6b7280"
              }} />
              <span style={{ fontWeight: "500" }}>
                Blockchain-сеть: {
                  connectionStatus === "connected" ? "Подключена" :
                  connectionStatus === "connecting" ? "Подключается..." :
                  connectionStatus === "error" ? "Ошибка подключения" : "Готова к настройке"
                }
              </span>
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                backgroundColor: "#10b981"
              }} />
              <span style={{ fontWeight: "500" }}>Компоненты развернуты</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                backgroundColor: "#10b981"
              }} />
              <span style={{ fontWeight: "500" }}>Конфигурация применена</span>
            </div>
          </div>
        </div>

        {taskId && wsEvents.length > 0 && (
          <div style={{ marginBottom: "24px" }}>
            <h4 style={{ margin: "0 0 12px 0", color: "#374151" }}>
              Процесс подключения (задача {taskId})
            </h4>
            <div style={{
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              padding: "12px",
              background: "#f9fafb",
              maxHeight: "200px",
              overflowY: "auto",
              fontFamily: "monospace",
              fontSize: "13px"
            }}>
              {wsEvents.map((event, index) => (
                <div key={index} style={{ marginBottom: "4px", color: "#374151" }}>
                  <strong>{event.type}:</strong> {
                    event.type === "event" 
                      ? event.payload?.message || JSON.stringify(event.payload)
                      : event.message || JSON.stringify(event)
                  }
                </div>
              ))}
            </div>
          </div>
        )}

        {connectionStatus === "idle" && (
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <button
              onClick={performNetworkConnection}
              disabled={isSubmitting || connectionStatus === "connecting"}
              style={{
                padding: "12px 24px",
                backgroundColor: "#0b66ff",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: connectionStatus === "connecting" ? "not-allowed" : "pointer",
                opacity: connectionStatus === "connecting" ? 0.6 : 1
              }}
            >
              {connectionStatus === "connecting" ? "Подключение..." : "Подключиться к сети"}
            </button>
          </div>
        )}

        <div style={{
          background: "#f0f9ff", 
          border: "1px solid #bae6fd", 
          borderRadius: "8px",
          padding: "16px",
          marginBottom: "16px"
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
            <div>
              <h4 style={{ margin: "0 0 8px 0", color: "#0c4a6e", fontSize: "14px" }}>
                Готово к запуску!
              </h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}