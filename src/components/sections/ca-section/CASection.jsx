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
    const ca = item.agent_ca ?? {};
    const agent = { id: item.agent_id };
    const status = item.agent_status;
    
    return (
      <PeerTile
        peer={{ ...ca, agent_status: status }}
        agent={agent}
        onClick={() => handleClick(item.agent_id, ca?.id)}
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