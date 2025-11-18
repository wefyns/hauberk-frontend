import React from "react";

import { ListSection } from "../../list-section/ListSection";
import { PeerTile } from "../../peer-tile/PeerTile";

import { generalService } from "../../../services";

export default function DBInfoSection() {
  const fetcher = async () => {
    return generalService.getDbInfo();
  };

  const renderItem = (item) => {
    console.log('item', item)
    return (
      <PeerTile
        key={`${item.type}-${item.agent_id || 'global'}`}
        peer={{
          id: `${item.type}-${item.agent_id || 'global'}`,
          name: item.type,
          version: item.version,
          status: item.status,
        }}
        agent={{ id: item.agent_id }}
        onClick={() => {}}
      />
    );
  };

  return (
    <ListSection
      title="Информация о СУБД"
      queryKey={["db-info"]}
      fetcher={fetcher}
      renderItem={renderItem}
      defaultPageSize={10}
      pageSizeOptions={[10, 20, 50, 100]}
      label="Показать"
      keyExtractor="databases"
      enablePagination
    />
  );
}