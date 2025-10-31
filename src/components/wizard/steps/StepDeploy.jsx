import React, { useEffect, useRef, useState, useCallback } from "react";
import { agentService } from "../../../services";
import styles from "./Steps.module.css";


export function StepDeploy({ registerSubmit, isSubmitting, orgId, agentId }) {
  const mountedRef = useRef(true);
  const [error, setError] = useState(null);

  const [deploymentStatus, setDeploymentStatus] = useState({
    started: false,
    completed: false,
    orderer: "pending",
    peer0: "pending",
    peer1: "pending",
  });

  const [logs, setLogs] = useState([]);
  const [deploying, setDeploying] = useState(false);

  const pushLog = useCallback((line) => {
    if (mountedRef.current) {
      setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${line}`]);
    }
  }, []);

  const performDeployment = useCallback(async () => {
    setError(null);
    setDeploying(true);
    setDeploymentStatus(prev => ({ ...prev, started: true }));
    setLogs([]);

    try {
      pushLog("Начинается развертывание Hyperledger Fabric узлов...");
      
      const deploymentSteps = [
        {
          key: "orderer",
          label: "Развертывание Orderer узла",
          action: () => agentService.enrollOrderer(parseInt(orgId), parseInt(agentId), "default")
        },
        {
          key: "peer0",
          label: "Развертывание первого Peer узла",
          action: () => agentService.enrollPeer(parseInt(orgId), parseInt(agentId), 0, 0)
        },
        {
          key: "peer1", 
          label: "Развертывание второго Peer узла",
          action: () => agentService.enrollPeer(parseInt(orgId), parseInt(agentId), 1, 1)
        }
      ];

      let allSuccess = true;

      for (const step of deploymentSteps) {
        if (!mountedRef.current) break;
        
        setDeploymentStatus(prev => ({ ...prev, [step.key]: "in_progress" }));
        pushLog(`${step.label}...`);
        
        try {
          await step.action();
          setDeploymentStatus(prev => ({ ...prev, [step.key]: "success" }));
          pushLog(`${step.label} - завершено успешно ✅`);
        } catch (stepError) {
          console.error(`Ошибка развертывания ${step.key}:`, stepError);
          setDeploymentStatus(prev => ({ ...prev, [step.key]: "error" }));
          pushLog(`${step.label} - ошибка: ${stepError.message} ❌`);
          allSuccess = false;
          break;
        }
      }

      if (allSuccess && mountedRef.current) {
        pushLog("Все компоненты успешно развернуты!");
        setDeploymentStatus(prev => ({ ...prev, completed: true }));
        return { success: true, meta: { deploymentCompleted: true } };
      } else {
        const errorMsg = "Развертывание остановлено из-за ошибок";
        pushLog(`${errorMsg}`);
        return { success: false, error: errorMsg };
      }
      
    } catch (err) {
      const errorMsg = `Ошибка развертывания: ${err.message}`;
      pushLog(`${errorMsg}`);
      return { success: false, error: errorMsg };
    } finally {
      if (mountedRef.current) {
        setDeploying(false);
      }
    }
  }, [orgId, agentId, pushLog]);

  const handleWizardSubmit = useCallback(async () => {
    if (deploymentStatus.completed) {
      return { success: true, meta: { deploymentCompleted: true } };
    }
    
    if (!deploymentStatus.started) {
      return await performDeployment();
    }
    
    return { success: false, error: "Развертывание еще не завершено" };
  }, [deploymentStatus, performDeployment]);

  useEffect(() => {
    if (orgId && agentId) {
      registerSubmit(handleWizardSubmit);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleWizardSubmit, orgId, agentId]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const renderStatusBadge = (statusKey) => {
    const status = deploymentStatus[statusKey];
    const statusConfig = {
      success: { text: "Готово", className: styles.statusSuccess },
      error: { text: "Ошибка", className: styles.statusError },
      in_progress: { text: "Выполняется...", className: styles.statusProgress },
      pending: { text: "Ожидание", className: styles.statusPending }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return <span className={config.className}>{config.text}</span>;
  };

  if (!orgId || !agentId) {
    return (
      <div className={styles.stepContainer}>
        <div className={styles.stepContent}>
          <div className={styles.errorMessage}>
            Ошибка: Необходимо создать организацию и агента перед развертыванием
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.stepContainer}>
      <div className={styles.stepContent}>
        <h2 className={styles.stepTitle}>Развертывание</h2>

        {error && (
          <div className={styles.errorMessage}>
            <p>{error}</p>
          </div>
        )}

        <div style={{ 
          border: "1px solid #e5e7eb", 
          borderRadius: "8px", 
          padding: "16px",
          marginBottom: "24px",
          background: "#fafafa"
        }}>
          <h4 style={{ margin: "0 0 16px 0", color: "#374151" }}>Статус развертывания</h4>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: "500" }}>Orderer узел</span>
              {renderStatusBadge("orderer")}
            </div>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: "500" }}>Peer 0 узел</span>
              {renderStatusBadge("peer0")}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: "500" }}>Peer 1 узел</span>
              {renderStatusBadge("peer1")}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: "24px" }}>
          <h4 style={{ margin: "0 0 12px 0", color: "#374151" }}>Лог развертывания</h4>
          <div style={{
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            padding: "12px",
            background: "#f9fafb",
            minHeight: "200px",
            maxHeight: "300px",
            overflowY: "auto",
            fontFamily: "monospace",
            fontSize: "13px",
            lineHeight: "1.4"
          }}>
            {logs.length === 0 ? (
              <div style={{ color: "#6b7280", fontStyle: "italic" }}>
                {deploymentStatus.started ? "Инициализация..." : "Лог развертывания появится здесь..."}
              </div>
            ) : (
              logs.map((logLine, index) => (
                <div key={index} style={{ marginBottom: "4px", color: "#374151" }}>
                  {logLine}
                </div>
              ))
            )}
          </div>
        </div>

        {!deploymentStatus.started && (
          <div style={{ textAlign: "center" }}>
            <button
              onClick={performDeployment}
              disabled={deploying || isSubmitting}
              style={{
                padding: "12px 24px",
                backgroundColor: "#0b66ff",
                color: "white",
                border: "none",
                borderRadius: "0px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: deploying ? "not-allowed" : "pointer",
                opacity: deploying ? 0.6 : 1
              }}
            >
              {deploying ? "Развертывание..." : "Начать развертывание"}
            </button>
          </div>
        )}

        {deploymentStatus.completed && (
          <div style={{
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: "8px",
            padding: "16px",
            textAlign: "center",
            color: "#15803d"
          }}>
            <h4 style={{ margin: "0 0 8px 0" }}>Развертывание завершено!</h4>
          </div>
        )}
      </div>
    </div>
  );
}