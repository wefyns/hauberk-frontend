import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import NetworkModal from "../../components/modals/network-modal/NetworkModal";
import DeploymentModal from "../../components/modals/deployment-modal/DeploymentModal";
import AddAgentModal from "../../components/modals/add-agent-modal/AddAgentModal";
import { PeerTile } from "../../components/peer-tile/PeerTile";
import { ConfirmDialog } from "../../components/confirm-dialog/ConfirmDialog";

import { agentService } from "../../services/agentService";
import { organizationService } from "../../services/organizationService";
import { useOrganization } from "../../contexts/useOrganization";

import deleteIconUrl from '../../assets/images/delete-b.svg'
import arrowIconUrl from '../../assets/images/arrow.svg'
import cloudIconUrl from '../../assets/images/cloud.svg'
import networkIconUrl from '../../assets/images/network.svg'

import styles from "../Home.module.css";

function AgentsPage() {
  const { selectedOrganization } = useOrganization();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [filter, setFilter] = useState("");
  const [editingAgent, setEditingAgent] = useState(null);
  const [expandedAgents, setExpandedAgents] = useState(new Set());

  const [networkAgent, setNetworkAgent] = useState(null);
  const [networkModalOpen, setNetworkModalOpen] = useState(false);

  const [deploymentAgent, setDeploymentAgent] = useState(null);
  const [deploymentModalOpen, setDeploymentModalOpen] = useState(false);

  const [addAgentModalOpen, setAddAgentModalOpen] = useState(false);
  
  const [confirmDialog, setConfirmDialog] = useState({
    visible: false,
    title: "",
    message: "",
    onConfirm: null,
  });
  
  const { data: organizationsData } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => organizationService.getOrganizations(),
    select: (data) => data?.organizations || []
  });

  const { 
    data: agentsData, 
    isLoading: agentsLoading
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

  const deleteMutation = useMutation({
    mutationFn: ({ orgId, agentId }) => {
      return agentService.deleteAgent(orgId, agentId);
    },
    onSuccess: async (data, variables) => {
      queryClient.setQueryData(['agents'], (oldData) => {
        if (!oldData) return oldData;
        const agents = oldData.agents || [];
        return {
          ...oldData,
          agents: agents.filter(agent => agent.id !== variables.agentId)
        };
      });
      
      setConfirmDialog({ ...confirmDialog, visible: false });

      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
    onError: (err) => {
      console.error("delete agent failed:", err);
      alert("Ошибка при удалении агента: " + (err.message || String(err)));
    },
  });

  const handleDeleteAgent = (e, agent) => {
    e.stopPropagation();
    setConfirmDialog({
      visible: true,
      title: "Удалить агента?",
      message: `Вы уверены, что хотите удалить агента ${agent.host}:${agent.port}?`,
      onConfirm: () => {
        deleteMutation.mutate({ 
          orgId: agent.organization_id || selectedOrganization?.id, 
          agentId: agent.id 
        });
      },
    });
  };

  const toggleAgentExpanded = (e, agentId) => {
    e.stopPropagation();
    setExpandedAgents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(agentId)) {
        newSet.delete(agentId);
      } else {
        newSet.add(agentId);
      }
      return newSet;
    });
  };

  const shouldShowDeployButton = (agent) => {
    const caList = agent.ca_list || [];
    const peerList = agent.peer_list || [];
    const ordererList = agent.orderer_list || [];

    if (caList.length === 0 && peerList.length === 0 && ordererList.length === 0) {
      return true;
    }

    const caRunning = caList.length > 0 && caList.every(ca => ca.status === 'running' || ca.status === 'deployed');
    const peersRunning = peerList.length >= 2 && peerList.every(p => p.status === 'running' || p.status === 'deployed');
    const ordererRunning = ordererList.length > 0 && ordererList.every(o => o.status === 'running' || o.status === 'deployed');

    return !(caRunning && peersRunning && ordererRunning);
  };

  const handlePeerClick = (e, agentId, peerId) => {
    e.stopPropagation();
    navigate(`/home/agents/${agentId}/peers/${encodeURIComponent(peerId)}`);
  };

  const handleOrdererClick = (e, agentId, ordererId) => {
    e.stopPropagation();
    navigate(`/home/agents/${agentId}/orderers/${encodeURIComponent(ordererId)}`);
  };

  const handleCAClick = (e, agentId, caId) => {
    e.stopPropagation();
    navigate(`/home/agents/${agentId}/ca/${encodeURIComponent(caId)}`);
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
            filterData.map((agent) => {
              const isExpanded = expandedAgents.has(agent.id);
              const badgeColor = agent.status === 'discoverable' ? 'green' : 'red';
              const showDeployButton = shouldShowDeployButton(agent);
              
              return (
                <div key={agent.id} style={{ marginBottom: 8 }}>
                  <div
                    className={styles.wrapperCounterparty}
                    onClick={() => handleEditClick(agent)}
                    role="button"
                    tabIndex={0}
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12, paddingLeft: 12 }}>
                      <button
                        type="button"
                        onClick={(e) => toggleAgentExpanded(e, agent.id)}
                        className={`${styles.button} ${isExpanded ? styles.buttonOutlineArrowExp : styles.buttonOutlineArrow }`}
                        title="Показать/скрыть объекты агента" 
                      >
                        <img src={arrowIconUrl} alt="arrow icon" />
                      </button>

                      <div 
                        style={{
                          position: 'absolute',
                          top: '0px',
                          left: '0px',
                          width: 12,
                          height: 12,
                          borderRadius: 0,
                          backgroundColor: badgeColor === 'green' ? '#10b981' : '#ef4444',
                          border: '1px solid rgba(0,0,0,0.06)',
                          flexShrink: 0
                        }}
                        title={agent.status === 'discoverable' ? 'Доступен' : 'Недоступен'}
                      />
                    </div>

                    <div className={styles.info} style={{ flex: 1, paddingLeft: 12 }}>
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
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      {showDeployButton && (
                        <button
                          type="button"
                          className={`${styles.button} ${styles.buttonOutlineDelete}`}
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setDeploymentAgent(agent); 
                            setDeploymentModalOpen(true); 
                          }}
                          title="Мастер развертывания сегмента"
                        >
                          <img src={cloudIconUrl} alt="cloud icon" />
                        </button>
                      )}
                      
                      <button
                        type="button"
                        className={`${styles.button} ${styles.buttonOutlineDelete}`}
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setNetworkAgent(agent); 
                          setNetworkModalOpen(true); 
                        }}
                        title="Мастер присоединения к новой сети"
                      >
                        <img src={networkIconUrl} alt="network icon" />
                      </button>

                      <button
                        onClick={(e) => handleDeleteAgent(e, agent)}
                        className={`${styles.button} ${styles.buttonOutlineDelete}`}
                        title="Удалить агента"
                      >
                        <img src={deleteIconUrl} alt="delete icon" />
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div style={{
                      marginTop: 4,
                      padding: 16,
                      background: "#f9fafb",
                      border: "1px solid #e5e7eb",
                      borderRadius: 0
                    }}>
                      <div style={{ fontSize: 13, color: "#64748b", marginBottom: 12 }}>
                        Объекты, управляемые агентом:
                      </div>
                      
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 8 }}>
                          Peers ({(agent.peer_list || []).length})
                        </div>
                        {(agent.peer_list || []).length > 0 ? (
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 8 }}>
                            {agent.peer_list.map((peer, index) => (
                              <PeerTile
                                key={peer.id || index}
                                type="peer"
                                peer={peer}
                                agent={{ id: agent.id }}
                                onClick={(e) => handlePeerClick(e, agent.id, peer.id)}
                              />
                            ))}
                          </div>
                        ) : (
                          <div style={{ fontSize: 13, color: "#9ca3af" }}>Нет peers</div>
                        )}
                      </div>

                      <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 8 }}>
                          Orderers ({(agent.orderer_list || []).length})
                        </div>
                        {(agent.orderer_list || []).length > 0 ? (
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 8 }}>
                            {agent.orderer_list.map((orderer, index) => (
                              <PeerTile
                                key={orderer.id || index}
                                type="orderer"
                                peer={orderer}
                                agent={{ id: agent.id }}
                                onClick={(e) => handleOrdererClick(e, agent.id, orderer.id)}
                              />
                            ))}
                          </div>
                        ) : (
                          <div style={{ fontSize: 13, color: "#9ca3af" }}>Нет orderers</div>
                        )}
                      </div>

                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 8 }}>
                          Сертификаты ({(agent.ca_list || []).length})
                        </div>
                        {(agent.ca_list || []).length > 0 ? (
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 8 }}>
                            {agent.ca_list.map((ca, index) => (
                              <PeerTile
                                key={ca.id || index}
                                type="ca"
                                peer={ca}
                                agent={{ id: agent.id }}
                                onClick={(e) => handleCAClick(e, agent.id, ca.id)}
                              />
                            ))}
                          </div>
                        ) : (
                          <div style={{ fontSize: 13, color: "#9ca3af" }}>Нет CA</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
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
            queryClient.invalidateQueries({ queryKey: ['agents'] });
            setAddAgentModalOpen(false);
            setEditingAgent(null);
          }}
        />
      )}

      <ConfirmDialog
        visible={confirmDialog.visible}
        onClose={() => setConfirmDialog({ ...confirmDialog, visible: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText="Удалить"
        cancelText="Отмена"
        variant="danger"
      />
    </>
  );
}

export default AgentsPage;
