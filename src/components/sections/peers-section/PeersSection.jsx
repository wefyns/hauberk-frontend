import React, { useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { ListSection } from '../../list-section/ListSection'
import { PeerTile } from "../../peer-tile/PeerTile";

import { agentService } from "../../../services";

export function PeersSection() {
  const { orgId } = useParams();
  const navigate = useNavigate();

  const fetcher = async () => {
    return agentService.getAllPeersInOrg(parseInt(orgId, 10));
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
      defaultPageSize={10}
      pageSizeOptions={[5, 10, 15, 20]}
      label="Показать"
      keyExtractor='peers'
    />
  );
}