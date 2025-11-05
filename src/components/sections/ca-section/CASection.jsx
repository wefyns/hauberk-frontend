import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { ListSection } from "../../list-section/ListSection";
import { PeerTile } from "../../peer-tile/PeerTile";

import { agentService } from "../../../services";

export function CAsSection() {
  const navigate = useNavigate();

  const fetcher = async () => {
    return agentService.getAllCAsInOrg();
  };

  const handleClick = useCallback(
    (agentId, caId) => {
      navigate(`/home/agents/${agentId}/ca/${encodeURIComponent(caId)}`);
    },
    [navigate]
  );

  const renderItem = (item) => {
    const ca = item.ca ?? item;
    const agent = item.agent ?? item.agent;
    return (
      <PeerTile
        peer={ca}
        agent={agent}
        onClick={() => handleClick(agent?.id, ca?.id)}
      />
    );
  };

  return (
    <ListSection
      title="Центры сертификации"
      queryKey={["cas"]}
      fetcher={fetcher}
      renderItem={renderItem}
      defaultPageSize={5}
      pageSizeOptions={[5, 10, 15]}
      label="Показать"
      keyExtractor={'cas'}
    />
  );
}