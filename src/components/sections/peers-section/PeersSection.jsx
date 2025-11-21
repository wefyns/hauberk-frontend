import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { ListSection } from '../../list-section/ListSection'
import { PeerTile } from "../../peer-tile/PeerTile";

import { agentService } from "../../../services";

export function PeersSection() {
  const navigate = useNavigate();

  const fetcher = async () => {
    return agentService.getAllPeersInOrg();
  };

  const handlePeerClick = useCallback(
    (agentId, peerId) => {
      navigate(
        `/home/agents/${agentId}/peers/${encodeURIComponent(peerId)}`
      );
    },
    [navigate]
  );

  const renderItem = (item) => {
    const agentPeers = item.agent_peers || [];
    const agentId = item.agent_id;
    const agentStatus = item.agent_status;
    
    return agentPeers.map((peer, index) => (
      <PeerTile
        key={peer.id || index}
        type="peer"
        peer={{ ...peer, agent_status: agentStatus }}
        agent={{ id: agentId }}
        onClick={() => handlePeerClick(agentId, peer.id)}
      />
    ));
  };

  return (
    <ListSection
      title="Peers"
      queryKey={["peers"]}
      fetcher={fetcher}
      renderItem={renderItem}
      defaultPageSize={10}
      pageSizeOptions={[10, 20, 50, 100]}
      label="Показать"
      keyExtractor='peers'
      enablePagination
    />
  );
}