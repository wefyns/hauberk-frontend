import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { agentService } from "../../services/agentService";
import styles from "../Home.module.css";

function AgentDeploymentPage() {
  const { orgId, agentId } = useParams(); 
  const navigate = useNavigate();

  const steps = [
    { key: "orderer", label: "Deploy Orderer", action: () => agentService.enrollOrderer(orgId, agentId) },
    { key: "peer0", label: "Deploy Peer 0", action: () => agentService.enrollPeer(orgId, agentId, 0) },
    { key: "peer1", label: "Deploy Peer 1", action: () => agentService.enrollPeer(orgId, agentId, 1) },
  ];

  const [status, setStatus] = useState({
    orderer: "pending",
    peer0: "pending",
    peer1: "pending",
  });

  const [deploying, setDeploying] = useState(false);

  const handleDeploy = async () => {
    setDeploying(true);

    for (const step of steps) {
      setStatus((prev) => ({ ...prev, [step.key]: "in_progress" }));
      try {
        await step.action();
        setStatus((prev) => ({ ...prev, [step.key]: "success" }));
      } catch (err) {
        console.error(`Deployment step ${step.key} failed:`, err);
        setStatus((prev) => ({ ...prev, [step.key]: "error" }));
        break;
      }
    }

    setDeploying(false);

    const allSuccess = Object.values(status).every((s) => s === "success");
    
    if (allSuccess) {
      setTimeout(() => navigate("/"), 1000);
    }
  };

  const renderStatusIcon = (stepKey) => {
    switch (status[stepKey]) {
      case "success":
        return 'Success';
      case "error":
        return 'Error';
      case "in_progress":
        return <span className={styles.inProgress}>Progress</span>;
      default:
        return <span className={styles.pending}>Default</span>;
    }
  };

  return (
    <div className={styles.deploymentContainer}>
      <div className={styles.deploymentHeader}>
        <h3>Deployment Status</h3>

        <button
          onClick={handleDeploy}
          disabled={deploying}
          className={styles.deployButton}
        >
          {deploying ? "Deploying..." : "Start Deployment"}
        </button>
      </div>
      <ul className={styles.deploymentList}>
        {steps.map((step) => (
          <li key={step.key}>
            {renderStatusIcon(step.key)} {step.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AgentDeploymentPage;
