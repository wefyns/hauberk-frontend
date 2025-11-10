import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";

import NetworkModal from "../../components/modals/network-modal/NetworkModal";
import DeploymentModal from "../../components/modals/deployment-modal/DeploymentModal";
import AddAgentModal from "../../components/modals/add-agent-modal/AddAgentModal";

import { agentService } from "../../services/agentService";
import { organizationService } from "../../services/organizationService";
import { useOrganization } from "../../contexts/useOrganization";

import styles from "../Home.module.css";

function AgentsPage() {
  const { selectedOrganization } = useOrganization();

  const [filter, setFilter] = useState("");
  const [editingAgent, setEditingAgent] = useState(null);

  const [networkAgent, setNetworkAgent] = useState(null);
  const [networkModalOpen, setNetworkModalOpen] = useState(false);

  const [deploymentAgent, setDeploymentAgent] = useState(null);
  const [deploymentModalOpen, setDeploymentModalOpen] = useState(false);

  const [addAgentModalOpen, setAddAgentModalOpen] = useState(false);
  
  const { data: organizationsData } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => organizationService.getOrganizations(),
    select: (data) => data?.organizations || []
  });

  const { 
    data: agentsData, 
    isLoading: agentsLoading, 
    refetch: refetchAgents 
  } = useQuery({
    queryKey: ['agents'],
    queryFn: () => agentService.getAgents(),
    select: (data) => data?.agents || []
  });

  const getOrganizationName = (organizationId) => {
    const org = organizationsData?.find(o => o.id === organizationId);
    return org?.name || `Org #${organizationId}`;
  };

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
          <div className={styles.loader}>Загрузка...</div>
        </div>
      )}

      {!agentsLoading && (
        <div className={ (noDataOrFound && filterData.length === 0) ? styles.wrapperBottom : styles.content }>
          {noDataOrFound && filterData.length === 0 ? (
            <div className={styles.notFound}>
              <div className={styles.textNotFound}>Агентов пока нет</div>
              <div style={{ marginTop: 16 }}>
                <button type="button" className={styles.invite} onClick={handleAddClick}>Создайте первого агента</button>
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
                      <div className={styles.orgHeader}>
                        <div className={styles.name}>{agent.host}:{agent.port}</div>
                        <span className={styles.orgId}>ID: {agent.id}</span>
                      </div>
                      <div className={styles.description}>
                        {agent.organization_id && (
                          <>
                            <div className={styles.reduction}>Организация:</div>
                            <div className={styles.value}>{getOrganizationName(agent.organization_id)}</div>
                            <div style={{ width: 24 }} />
                          </>
                        )}
                        <div className={styles.reduction}>UUID:</div>
                        <div className={styles.value}>{agent.uuid}</div> 
                        
                        <div style={{ width: 24 }} />
                        <div className={styles.reduction}>Protocol:</div>
                        <div className={styles.value}>{agent.protocol}</div>
                        <div style={{ width: 24 }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    type="button"
                    className={`${styles.button} ${styles.buttonAgentDeploy}`}
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setDeploymentAgent(agent); 
                      setDeploymentModalOpen(true); 
                    }}
                  >
                    Развертывание
                  </button>
                  
                  <button
                    type="button"
                    className={`${styles.button} ${styles.buttonAgentNetwork}`}
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setNetworkAgent(agent); 
                      setNetworkModalOpen(true); 
                    }}
                  >
                    Сеть
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
          orgId={selectedOrganization?.id}
          agentId={networkAgent.id}
        />
      )}

      {deploymentAgent && (
        <DeploymentModal
          visible={deploymentModalOpen}
          onClose={() => { setDeploymentModalOpen(false); setDeploymentAgent(null); }}
          orgId={selectedOrganization?.id}
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
          orgId={selectedOrganization?.id}
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
