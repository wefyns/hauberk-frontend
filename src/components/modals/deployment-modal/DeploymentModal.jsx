import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Dialog } from "../../dialog/Dialog";

import { agentService } from "../../../services";

import styles from "./DeploymentModal.module.css";

export default function DeploymentModal({ visible, onClose, orgId, agentId }) {
  const navigate = useNavigate();

  const mountedRef = useRef(true);
  const timeoutRef = useRef(null);

  const [status, setStatus] = useState({
    orderer: "pending",
    peer0: "pending",
    peer1: "pending",
  });

  const [logs, setLogs] = useState([]);
  const [deploying, setDeploying] = useState(false);

  useEffect(() => {
    mountedRef.current = true;
    if (!visible) {
      setStatus({ orderer: "pending", peer0: "pending", peer1: "pending" });
      setDeploying(false);
      setLogs([]);
    }
    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [visible]);

  const pushLog = (line) => {
    setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${line}`]);
  };

  const handleDeploy = async () => {
    setDeploying(true);
    setLogs([]);

    const nextStatus = { ...status };

    const steps = [
      { key: "orderer", label: "Deploy Orderer", action: () => agentService.enrollOrderer(parseInt(orgId), parseInt(agentId), "default"), },
      { key: "peer0", label: "Deploy Peer 0", action: () => agentService.enrollPeer(parseInt(orgId), parseInt(agentId), 0, 0) },
      { key: "peer1", label: "Deploy Peer 1", action: () => agentService.enrollPeer(parseInt(orgId), parseInt(agentId), 1, 1) },
    ];

    let allSuccess = true;

    for (const step of steps) {
      if (!mountedRef.current) break;
      nextStatus[step.key] = "in_progress";
      setStatus({ ...nextStatus });
      pushLog(`Начинаем: ${step.label}`);
      try {
        await step.action();
        pushLog(`${step.label} — выполнено успешно.`);
        nextStatus[step.key] = "success";
        setStatus({ ...nextStatus });
      } catch (err) {
        console.error(`Deployment step ${step.key} failed:`, err);
        allSuccess = false;
        nextStatus[step.key] = "error";
        setStatus({ ...nextStatus });
        break;
      }
    }

    if (allSuccess) {
      pushLog("Все шаги выполнены успешно.");

      if (mountedRef.current) {
        timeoutRef.current = setTimeout(() => {
          if (!mountedRef.current) return;
          navigate(`/home/${orgId}`);
        }, 700);
      }
    } else {
      pushLog("Деплой остановлен из-за ошибки.");
    }

    if (mountedRef.current) setDeploying(false);
  };

  const renderStatusTag = (key) => {
    switch (status[key]) {
      case "success":
        return <span className={styles.statusSuccess}>Успех</span>;
      case "error":
        return <span className={styles.statusError}>Ошибка</span>;
      case "in_progress":
        return <span className={styles.statusProgress}>Выполняется</span>;
      default:
        return <span className={styles.statusPending}>Ожидает</span>;
    }
  };

  return (
    <Dialog
      visible={visible}
      onClose={(reason) => { onClose?.(reason); }}
      title={`Deployment — агент ${agentId}`}
      width="medium"
      height="auto"
      position="center"
      backdropVariant="blur"
      footerButtons={() => {}}
    >
      <div className={styles.deploymentBody}>
        <div className={styles.headerRow}>
          <h4>Запуск деплоя Hyperledger Fabric</h4>
        </div>

        <div className={styles.steps}>
          <div className={styles.stepRow}>
            {renderStatusTag("orderer")}
            <div className={styles.stepLabel}>Deploy Orderer</div>
          </div>
          <div className={styles.stepRow}>
            {renderStatusTag("peer0")}
            <div className={styles.stepLabel}>Deploy Peer 0</div>
          </div>
          <div className={styles.stepRow}>
            {renderStatusTag("peer1")}
            <div className={styles.stepLabel}>Deploy Peer 1</div>
          </div>
        </div>

        <div className={styles.logsBlock}>
          <h5>Лог процесса</h5>
          <div className={styles.logs}>
            {logs.length === 0 ? (
              <div className={styles.logEmpty}>Здесь будут сообщения процесса...</div>
            ) : (
              logs.map((l, i) => <div key={i} className={styles.logLine}>{l}</div>)
            )}
          </div>
        </div>

        <div className={styles.footerButton}>
          <button
            type="button"
            className={styles.primary}
            onClick={handleDeploy}
            disabled={deploying}
          >
            {deploying ? "Выполняется..." : "Начать развертывание"}
          </button>
        </div>
      </div>
    </Dialog>
  );
}