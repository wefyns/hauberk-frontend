import React, { useCallback, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Switch } from "../../components/switch/Switch";

import { agentService, organizationService } from "../../services";
import { useOrganization } from "../../contexts/useOrganization";

import styles from './DetailsPage.module.css';

export function OrdererDetailsPage() {
  const { agentId, ordererId } = useParams();
  const { selectedOrganization } = useOrganization();

  const [enabled, setEnabled] = useState(false);
  const [error, setError] = useState(null);

  const { 
    data: ordererData, 
    isPending: ordererPending, 
    isError: ordererError,
  } = useQuery({
    queryKey: ['orderer', selectedOrganization?.id, agentId, ordererId],
    queryFn: async () => {
      const data = await agentService.getOrderer(selectedOrganization?.id, parseInt(agentId), ordererId);
      return data;
    },
    enabled: !!selectedOrganization?.id && !!agentId && !!ordererId,
  });
  
  const { data: organizationsData } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => organizationService.getOrganizations(),
    enabled: !!ordererData?.organization_id,
  });

  const organization = organizationsData?.organizations?.find(
    org => org.id === ordererData?.organization_id
  );

  useEffect(() => {
    if (ordererData?.status === 'running' || ordererData?.status === 'deployed') {
      setEnabled(true);
    } else {
      setEnabled(false);
    }
  }, [ordererData]);

  const mutationStop = useMutation({
    mutationFn: () => agentService.enrollOrdererStop(selectedOrganization?.id, agentId, ordererId),
    onError: (err) => {
      setError(`Ошибка остановки orderer: ${err.message}`);
    },
  })

  const mutationRestart = useMutation({
    mutationFn: () => agentService.enrollOrdererRestart(selectedOrganization?.id, agentId, ordererId),
    onError: (err) => {
      setError(`Ошибка перезапуска orderer: ${err.message}`);
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

  if (ordererPending) return <div className={styles.loading}>Загрузка...</div>;
  if (ordererError || !ordererData) return <div className={styles.error}>Orderer не найден</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Управление Orderer: {ordererData.host_name || ordererData.id || 'Неизвестный'}</h1>

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
          <span className={styles.value}>{ordererData.id || '—'}</span>
        </div>
        
        <div className={styles.infoRow}>
          <span className={styles.label}>Host Name:</span>
          <span className={styles.value}>{ordererData.host_name || '—'}</span>
        </div>
        
        <div className={styles.infoRow}>
          <span className={styles.label}>Domain:</span>
          <span className={styles.value}>{ordererData.domain_name || '—'}</span>
        </div>
        
        <div className={styles.infoRow}>
          <span className={styles.label}>Address:</span>
          <span className={styles.value}>{ordererData.address || '—'}</span>
        </div>
        
        <div className={styles.infoRow}>
          <span className={styles.label}>MSP ID:</span>
          <span className={styles.value}>{ordererData.msp_id || '—'}</span>
        </div>
        
        <div className={styles.infoRow}>
          <span className={styles.label}>Status:</span>
          <span className={styles.value}>{ordererData.status || '—'}</span>
        </div>
        
        <div className={styles.infoRow}>
          <span className={styles.label}>Local:</span>
          <span className={styles.value}>{ordererData.local ? 'Yes' : 'No'}</span>
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
