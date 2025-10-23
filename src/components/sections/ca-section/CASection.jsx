import React, { useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { ListSection } from "../../list-section/ListSection";
import { PeerTile } from "../../peer-tile/PeerTile";

import { agentService } from "../../../services";

export function CAsSection() {
  const { orgId } = useParams();
  const navigate = useNavigate();

  const fetcher = async () => {
    return agentService.getAllCAsInOrg(parseInt(orgId, 10));
  };

  const handleClick = useCallback(
    (agentId) => {
      navigate(`/organizations/${orgId}/agents/${agentId}/ca`);
    },
    [navigate, orgId]
  );

  const renderItem = (item) => {
    const ca = item.ca ?? item;
    const agent = item.agent ?? item.agent;
    return (
      <PeerTile
        peer={ca}
        agent={agent}
        onClick={() => handleClick(agent?.id)}
      />
    );
  };

  return (
    <ListSection
      title="Центры сертификации"
      queryKey={["cas", orgId]}
      fetcher={fetcher}
      renderItem={renderItem}
      defaultPageSize={5}
      pageSizeOptions={[5, 10, 15]}
      label="Показать"
      keyExtractor={'cas'}
    />
  );
}