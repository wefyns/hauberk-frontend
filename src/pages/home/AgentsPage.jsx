import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";

import { useParams } from "react-router-dom";

import NetworkModal from "../../components/modals/network-modal/NetworkModal";
import DeploymentModal from "../../components/modals/deployment-modal/DeploymentModal";
import AddAgentModal from "../../components/modals/add-agent-modal/AddAgentModal";

import { agentService } from "../../services/agentService";

import styles from "../Home.module.css";

function AgentsPage() {
  const { orgId } = useParams();

  const [filter, setFilter] = useState("");
  const [editingAgent, setEditingAgent] = useState(null);

  const [networkAgent, setNetworkAgent] = useState(null);
  const [networkModalOpen, setNetworkModalOpen] = useState(false);

  const [deploymentAgent, setDeploymentAgent] = useState(null);
  const [deploymentModalOpen, setDeploymentModalOpen] = useState(false);

  const [addAgentModalOpen, setAddAgentModalOpen] = useState(false);
  
  // Use useQuery for agents data
  const { 
    data: agentsData, 
    isLoading: agentsLoading, 
    refetch: refetchAgents 
  } = useQuery({
    queryKey: ['agents', orgId],
    queryFn: () => agentService.getAgents(parseInt(orgId)),
    enabled: !!orgId,
    select: (data) => data?.agents || []
  });

  const filterData = useMemo(() => {
    if (!filter || filter.trim() === "") return agentsData || [];
    const q = filter.trim().toLowerCase();
    return (agentsData || []).filter((a) => {
      if (!a) return false;

      const uuid = String(a.uuid || "").toLowerCase();
      const host = String(a.host || "").toLowerCase();
      const protocol = String(a.protocol || "").toLowerCase();
      return (
        uuid.includes(q) ||
        host.includes(q) ||
        protocol.includes(q)
      );
    });
  }, [agentsData, filter]);

  const handleEditClick = (agent) => {
    setEditingAgent(agent);
    setAddAgentModalOpen(true);
  };

  const handleAddClick = () => {
    setEditingAgent(null);
    setAddAgentModalOpen(true);
  };

  const noDataOrFound = (agentsData?.length || 0) === 0;

  return (
    <>
      <div className={styles.top}>
        <div className={styles.wrapperInput}>
          <div style={{ position: "relative" }}>
            <input
              className={styles.inputSearch}
              value={filter}
              placeholder="Поиск по имени, хосту, protocol"
              onChange={(e) => setFilter(e.target.value)}
              style={{ paddingLeft: 36, height: 40, borderRadius: 0 }}
            />
          </div>
        </div>

        <button
          type="button"
          className={styles.button}
          onClick={handleAddClick}
        >
          + Добавить агента
        </button>
      </div>

      {agentsLoading && (
        <div style={{ padding: 32, display: "flex", justifyContent: "center" }}>
          <div className={styles.loader}>Loading...</div>
        </div>
      )}

      {!agentsLoading && (
        <div className={ (noDataOrFound && filterData.length === 0) ? styles.wrapperBottom : styles.content }>
          {noDataOrFound && filterData.length === 0 ? (
            <div className={styles.notFound}>
              <div className={styles.textNotFound}>No agents yet</div>
              <div style={{ marginTop: 16 }}>
                <button type="button" className={styles.invite} onClick={handleAddClick}>Create first agent</button>
              </div>
            </div>
          ) : filterData.length === 0 ? (
            <div className={styles.wrapperBottom}>
              <div className={styles.textNotFound}>Ничего не найдено по запросу «{filter}»</div>
            </div>
          ) : (
            filterData.map((agent) => (
              <div
                key={agent.id}
                className={styles.wrapperCounterparty}
                onClick={() => handleEditClick(agent)}
                role="button"
                tabIndex={0}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
              >
                <div className={styles.info}>
                  <div className={styles.wrapperTop}>
                    <div>
                      <div className={styles.name}>{agent.uuid}</div>
                      <div className={styles.description}>
                        <div className={styles.reduction}>Host:</div>
                        <div className={styles.value}>{agent.host}:{agent.port}</div>
                        <div style={{ width: 24 }} />
                        <div className={styles.reduction}>Protocol:</div>
                        <div className={styles.value}>{agent.protocol}</div>
                        <div style={{ width: 24 }} />
                        <div className={styles.reduction}>Secret ID:</div>
                        <div className={styles.value}>{agent.secret_id ?? "—"}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    type="button"
                    className={`${styles.button} ${styles.buttonOutlineBlue}`}
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setNetworkAgent(agent); 
                      setNetworkModalOpen(true); 
                    }}
                  >
                    Network
                  </button>

                  <button
                    type="button"
                    className={`${styles.button} ${styles.buttonOutlineGreen}`}
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setDeploymentAgent(agent); 
                      setDeploymentModalOpen(true); 
                    }}
                  >
                    Deployment
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {networkAgent && (
        <NetworkModal
          visible={networkModalOpen}
          onClose={() => { 
            setNetworkModalOpen(false); 
            setNetworkAgent(null);
          }}
          orgId={orgId}
          agentId={networkAgent.id}
        />
      )}

      {deploymentAgent && (
        <DeploymentModal
          visible={deploymentModalOpen}
          onClose={() => { setDeploymentModalOpen(false); setDeploymentAgent(null); }}
          orgId={orgId}
          agentId={deploymentAgent.id}
        />
      )}

      {addAgentModalOpen && (
        <AddAgentModal
          visible={addAgentModalOpen}
          onClose={() => {
            setAddAgentModalOpen(false);
            setEditingAgent(null);
          }}
          orgId={orgId}
          editingAgent={editingAgent}
          onSuccess={() => {
            refetchAgents();
            setAddAgentModalOpen(false);
            setEditingAgent(null);
          }}
        />
      )}
    </>
  );
}

export default AgentsPage;
