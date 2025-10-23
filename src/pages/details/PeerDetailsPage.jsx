import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Switch } from "../../components/switch/Switch";

import { agentService } from "../../services";

import styles from './DetailsPage.module.css';

export function PeerDetailsPage() {
  const { orgId, agentId, peerId } = useParams();

  const [enabled, setEnabled] = useState(false);

  const { 
    data: peer, 
    isPending, 
    isError,
  } = useQuery({
    queryKey: ['peer', orgId, agentId, peerId],
    queryFn: async () => {
      const data = await agentService.getPeer(parseInt(orgId), parseInt(agentId), peerId);
      return data;
    },
    enabled: !!orgId && !!agentId && !!peerId,
    select: (data) => {
      setEnabled(data.enabled);
      return data;
    }
  });

  if (isPending) return <div className={styles.loading}>Загрузка...</div>;
  if (isError || !peer) return <div className={styles.error}>Пир не найден</div>;

   return (
    <div className={styles.container}>
      <h1 className={styles.title}>Управление пиром: {peer.name}</h1>

      <div className={styles.switchRow}>
        <span>Включить пир</span>
        <Switch checked={enabled} onChange={() => {}} />
      </div>

    </div>
  );
}