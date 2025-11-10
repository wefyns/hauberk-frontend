import React, { useState, useCallback, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Switch } from "../../components/switch/Switch";

import { agentService, organizationService } from "../../services";
import { useOrganization } from "../../contexts/useOrganization";

import styles from './DetailsPage.module.css';

export function FabricCADetailsPage() {
  const { agentId, caId } = useParams();
  const { selectedOrganization } = useOrganization();

  const [enabled, setEnabled] = useState(false);
  const [error, setError] = useState(null);

  const { 
    data: caData, 
    isPending: caPending, 
    isError: caError,
  } = useQuery({
    queryKey: ['peer', selectedOrganization?.id, agentId, caId],
    queryFn: async () => {
      const data = await agentService.getFabricCA(selectedOrganization?.id, parseInt(agentId), caId);
      return data;
    },
    enabled: !!selectedOrganization?.id && !!agentId && !!caId,
  });

  const { data: organizationsData } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => organizationService.getOrganizations(),
    enabled: !!caData?.organization_id,
  });

  const organization = organizationsData?.organizations?.find(
    org => org.id === caData?.organization_id
  );

  useEffect(() => {
    if (caData?.status === 'running' || caData?.status === 'deployed') {
      setEnabled(true);
    } else {
      setEnabled(false);
    }
  }, [caData]);

    const mutationStop = useMutation({
    mutationFn: () => agentService.enrollPeerStop(selectedOrganization?.id, agentId, caId),
    onError: (err) => {
      setError(`Ошибка остановки CA: ${err.message}`);
    },
  })

  const mutationRestart = useMutation({
    mutationFn: () => agentService.enrollPeerRestart(selectedOrganization?.id, agentId, caId),
    onError: (err) => {
      setError(`Ошибка перезапуска CA: ${err.message}`);
    },
  })

  const handleToggle = useCallback(async () => {
    if (enabled) {
      await mutationStop.mutateAsync(undefined, {
        onSuccess: () => setEnabled(false),
      });
    } else {
      await mutationRestart.mutateAsync(undefined, {
        onSuccess: () => setEnabled(true)
      })
    }
  }, [enabled, mutationRestart, mutationStop])

  if (caPending) return <div className={styles.loading}>Загрузка...</div>;
  if (caError || !caData) return <div className={styles.error}>Сертификат не найден</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Управление Fabric CA: {caData?.hostname || caData?.id || 'Неизвестный'}</h1>

        <div className={styles.switchRow}>
          <Switch checked={enabled} onChange={handleToggle} />
        </div>
      </div>

      {error && (
        <div className={styles.errorMessage}>
          <p>{error}</p>
        </div>
      )}

      <div className={styles.infoSection}>
        <div className={styles.infoRow}>
          <span className={styles.label}>ID:</span>
          <span className={styles.value}>{caData.id || '—'}</span>
        </div>
        
        <div className={styles.infoRow}>
          <span className={styles.label}>Hostname:</span>
          <span className={styles.value}>{caData.hostname || '—'}</span>
        </div>
        
        <div className={styles.infoRow}>
          <span className={styles.label}>Domain:</span>
          <span className={styles.value}>{caData.domain_name || '—'}</span>
        </div>
        
        <div className={styles.infoRow}>
          <span className={styles.label}>Address:</span>
          <span className={styles.value}>{caData.address || '—'}</span>
        </div>
        
        <div className={styles.infoRow}>
          <span className={styles.label}>Status:</span>
          <span className={styles.value}>{caData.status || '—'}</span>
        </div>
        
        <div className={styles.infoRow}>
          <span className={styles.label}>Local:</span>
          <span className={styles.value}>{caData.local ? 'Да' : 'Нет'}</span>
        </div>

        {organization && (
          <div className={styles.infoRow}>
            <span className={styles.label}>Организация:</span>
            <span className={styles.value}>{organization.name}</span>
          </div>
        )}
      </div>
    </div>
  );
}