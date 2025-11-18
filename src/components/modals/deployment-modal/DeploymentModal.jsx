import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { Dialog } from "../../dialog/Dialog";

import { agentService } from "../../../services";

import styles from "./DeploymentModal.module.css";

export default function DeploymentModal({ visible, onClose, orgId, agentId }) {
  const navigate = useNavigate();

  const mountedRef = useRef(true);
  const timeoutRef = useRef(null);

  const { data: agentsData } = useQuery({
    queryKey: ['agents'],
    queryFn: () => agentService.getAgents(),
    select: (data) => data?.agents || [],
    enabled: visible
  });

  const currentAgent = agentsData?.find(a => a.id === agentId);

  const [status, setStatus] = useState({
    ca: "pending",
    peer0: "pending",
    peer1: "pending",
    orderer: "pending",
  });

  const [logs, setLogs] = useState([]);
  const [deploying, setDeploying] = useState(false);

  const [deploySuccess, setDeploySuccess] = useState(false);

  useEffect(() => {
    mountedRef.current = true;
    if (!visible) {
      setStatus({ ca: "pending", peer0: "pending", peer1: "pending", orderer: "pending" });
      setDeploying(false);
      setLogs([]);
      setDeploySuccess(false);
    } else if (currentAgent) {
      const newStatus = {
        ca: "pending",
        peer0: "pending",
        peer1: "pending",
        orderer: "pending",
      };
      
      const caList = currentAgent.ca_list || [];
      if (caList.length > 0 && caList.some(ca => ca.status === 'running' || ca.status === 'deployed')) {
        newStatus.ca = "deployed";
      }

      const peerList = currentAgent.peer_list || [];
      if (peerList.length >= 1 && (peerList[0]?.status === 'running' || peerList[0]?.status === 'deployed')) {
        newStatus.peer0 = "deployed";
      }
      if (peerList.length >= 2 && (peerList[1]?.status === 'running' || peerList[1]?.status === 'deployed')) {
        newStatus.peer1 = "deployed";
      }

      const ordererList = currentAgent.orderer_list || [];
      if (ordererList.length > 0 && ordererList.some(o => o.status === 'running' || o.status === 'deployed')) {
        newStatus.orderer = "deployed";
      }

      setStatus(newStatus);
    }
    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [visible, currentAgent]);

  const pushLog = (line) => {
    setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${line}`]);
  };

  const handleDeploy = async () => {
    setDeploying(true);
    setLogs([]);
    setDeploySuccess(false);

    const nextStatus = { ...status };

    const steps = [
      { 
        key: "ca", 
        label: "Deploy CA", 
        action: () => agentService.enrollCA(parseInt(orgId), parseInt(agentId), "default"),
        shouldSkip: status.ca === "deployed"
      },
      { 
        key: "peer0", 
        label: "Deploy Peer 0", 
        action: () => agentService.enrollPeer(parseInt(orgId), parseInt(agentId), 0),
        shouldSkip: status.peer0 === "deployed"
      },
      { 
        key: "peer1", 
        label: "Deploy Peer 1", 
        action: () => agentService.enrollPeer(parseInt(orgId), parseInt(agentId), 1),
        shouldSkip: status.peer1 === "deployed"
      },
      { 
        key: "orderer", 
        label: "Deploy Orderer", 
        action: () => agentService.enrollOrderer(parseInt(orgId), parseInt(agentId), "default"),
        shouldSkip: status.orderer === "deployed"
      },
    ];

    let allSuccess = true;

    for (const step of steps) {
      if (!mountedRef.current) break;
      
      if (step.shouldSkip) {
        pushLog(`${step.label} — уже развернут, пропускаем.`);
        continue;
      }

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
        pushLog(`${step.label} — ошибка: ${err.message || String(err)}`);
        allSuccess = false;
        nextStatus[step.key] = "error";
        setStatus({ ...nextStatus });
        break;
      }
    }

    if (allSuccess) {
      pushLog("Все шаги выполнены успешно.");

      if (mountedRef.current) {
        setDeploySuccess(true);
      }
    } else {
      pushLog("Деплой остановлен из-за ошибки.");
      if (mountedRef.current) {
        setDeploySuccess(false);
      }
    }

    if (mountedRef.current) setDeploying(false);
  };

  const handleCloseAndNavigate = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    navigate('/home');
    onClose?.("close-button");
  };

  const renderStatusTag = (key) => {
    switch (status[key]) {
      case "deployed":
        return <span className={styles.statusSuccess}>Уже развернут</span>;
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
      customFooter={
        deploySuccess ? (
          <div className={styles.customFooterActions}>
            <button
              type="button"
              className={styles.primary}
              onClick={() => {
                setDeploySuccess(false);
                setStatus({ ca: "pending", peer0: "pending", peer1: "pending", orderer: "pending" });
                setLogs([]);
                handleCloseAndNavigate();
              }}
            >
              Закрыть и перейти
            </button>
          </div>
        ) : null
      }
    >
      <div className={styles.deploymentBody}>
        <div className={styles.headerRow}>
          <h4>Запуск деплоя Hyperledger Fabric</h4>
        </div>

        <div className={styles.steps}>
          <div className={styles.stepRow}>
            {renderStatusTag("ca")}
            <div className={styles.stepLabel}>Deploy CA</div>
          </div>
          <div className={styles.stepRow}>
            {renderStatusTag("peer0")}
            <div className={styles.stepLabel}>Deploy Peer 0</div>
          </div>
          <div className={styles.stepRow}>
            {renderStatusTag("peer1")}
            <div className={styles.stepLabel}>Deploy Peer 1</div>
          </div>
          <div className={styles.stepRow}>
            {renderStatusTag("orderer")}
            <div className={styles.stepLabel}>Deploy Orderer</div>
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
        
        {!deploySuccess && (
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
        )}
      </div>
    </Dialog>
  );
}