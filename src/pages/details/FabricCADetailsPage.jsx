import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Switch } from "../../components/switch/Switch";

import { agentService } from "../../services";
import { useOrganization } from "../../contexts/useOrganization";

import styles from './DetailsPage.module.css';

export function FabricCADetailsPage() {
  const { agentId, caId } = useParams();
  const { selectedOrganization } = useOrganization();

  const [enabled, setEnabled] = useState(false);

  const { 
    data: peer, 
    isPending, 
    isError,
  } = useQuery({
    queryKey: ['peer', selectedOrganization?.id, agentId, caId],
    queryFn: async () => {
      const data = await agentService.getFabricCA(selectedOrganization?.id, parseInt(agentId), caId);
      return data;
    },
    enabled: !!selectedOrganization?.id && !!agentId && !!caId,
    select: (data) => {
      setEnabled(data.enabled);
      return data;
    }
  });

  if (isPending) return <div className={styles.loading}>Загрузка...</div>;
  if (isError || !peer) return <div className={styles.error}>Сертификат не найден</div>;

   return (
    <div className={styles.container}>
      <h1 className={styles.title}>Управление Fabric CA: {peer.name}</h1>

      <div className={styles.switchRow}>
        <span>Включить сертификат</span>
        <Switch checked={enabled} onChange={() => {}} />
      </div>

    </div>
  );
}