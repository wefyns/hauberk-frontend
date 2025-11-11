import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { ListSection } from '../../list-section/ListSection'
import { PeerTile } from "../../peer-tile/PeerTile";

import { agentService } from "../../../services";

export function OrderersSection() {
  const navigate = useNavigate();

  const fetcher = async () => {
    return agentService.getAllOrderers();
  };

  const handleOrdererClick = useCallback(
    (agentId, ordererId) => {
      navigate(
        `/home/agents/${agentId}/orderers/${encodeURIComponent(ordererId)}`
      );
    },
    [navigate]
  );

  const renderItem = (item) => {
    const agentOrderers = item.agent_orderers || [];
    const agentId = item.agent_id;
    const agentStatus = item.agent_status;
    
    return agentOrderers.map((orderer, index) => (
      <PeerTile
        key={orderer.id || index}
        peer={{ ...orderer, agent_status: agentStatus }}
        agent={{ id: agentId }}
        onClick={() => handleOrdererClick(agentId, orderer.id)}
      />
    ));
  };

  return (
    <ListSection
      title="Orderers"
      queryKey={["orderers"]}
      fetcher={fetcher}
      renderItem={renderItem}
      defaultPageSize={10}
      pageSizeOptions={[10, 20, 50, 100]}
      label="Показать"
      keyExtractor='orderers'
      enablePagination
    />
  );
}
