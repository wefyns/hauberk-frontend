import React, { useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { ListSection } from '../../list-section/ListSection'
import { PeerTile } from "../../peer-tile/PeerTile";

import { agentService } from "../../../services";

export function PeersSection() {
  const { orgId } = useParams();
  const navigate = useNavigate();

  const fetcher = async () => {
    return agentService.getAllPeersInOrg();
  };

   const handlePeerClick = useCallback(
    (agentId, peerId) => {
      navigate(
        `/home/${orgId}/agents/${agentId}/peers/${encodeURIComponent(peerId)}`
      );
    },
    [navigate, orgId]
  );

   const renderItem = ({ peer, agent }) => {
    const peerId = peer?.id;
    return (
      <PeerTile
        peer={peer}
        agent={agent}
        onClick={() => handlePeerClick(agent.id, peerId)}
      />
    );
  };

  return (
    <ListSection
      title="Peers"
      queryKey={["peers", orgId]}
      fetcher={fetcher}
      renderItem={renderItem}
      defaultPageSize={20}
      pageSizeOptions={[10, 20, 50, 100]}
      label="Показать"
      keyExtractor='peers'
      enablePagination={true}
    />
  );
}