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
    const agentCAs = item.agent_ca || [];
    const agentId = item.agent_id;
    const agentStatus = item.agent_status;
    
    return agentCAs.map((ca, index) => (
      <PeerTile
        key={ca.id || index}
        peer={{ ...ca, agent_status: agentStatus }}
        agent={{ id: agentId }}
        onClick={() => handleClick(agentId, ca.id)}
      />
    ));
  };

  return (
    <ListSection
      title="Центры сертификации"
      queryKey={["cas"]}
      fetcher={fetcher}
      renderItem={renderItem}
      defaultPageSize={10}
      pageSizeOptions={[10, 20, 50, 100]}
      label="Показать"
      keyExtractor={'cas'}
      enablePagination
    />
  );
}