import React, { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Switch } from "../../components/switch/Switch";
import { ConfirmDialog } from "../../components/confirm-dialog/ConfirmDialog";

import { agentService, organizationService } from "../../services";
import { useOrganization } from "../../contexts/useOrganization";

import deleteIconUrl from '../../assets/images/delete.svg'

import styles from './DetailsPage.module.css';

export function FabricCADetailsPage() {
  const { agentId, caId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { selectedOrganization } = useOrganization();

  const [enabled, setEnabled] = useState(false);
  const [error, setError] = useState(null);
  const [action, setAction] = useState(null);
  
  const [confirmDialog, setConfirmDialog] = useState({
    visible: false,
    title: "",
    message: "",
    onConfirm: null,
  }); 

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
    if (caData?.status === 'running') {
    // if (caData?.status === 'running' || caData?.status === 'deployed') {
      setEnabled(true);
    } else {
      setEnabled(false);
    }
  }, [caData]);

  const mutationStop = useMutation({
    mutationFn: () =>
      agentService.fabricCAStop(selectedOrganization?.id, agentId, caId),
    onSuccess: async () => {
      setEnabled(false);
      await queryClient.invalidateQueries([
        "peer",
        selectedOrganization?.id,
        agentId,
        caId,
      ]);
    },
    onError: (err) => {
      setAction(null);
      setError(`Ошибка остановки CA: ${err.message}`);
    },
    onSettled: () => {
      setAction(null);
    }
  });

  const mutationRestart = useMutation({
    mutationFn: () =>
      agentService.fabricCARestart(selectedOrganization?.id, agentId, caId),
    onSuccess: async () => {
      setEnabled(true);
      await queryClient.invalidateQueries([
        "peer",
        selectedOrganization?.id,
        agentId,
        caId,
      ]);
    },
    onError: (err) => {
      setAction(null);
      setError(`Ошибка перезапуска CA: ${err.message}`);
    },
    onSettled: () => {
      setAction(null);
    }
  });

  const mutationDrop = useMutation({
    mutationFn: () =>
      agentService.fabricCADrop(selectedOrganization?.id, agentId, caId),
    onSuccess: async () => {
      await queryClient.invalidateQueries([
        "peer",
        selectedOrganization?.id,
        agentId,
        caId,
      ]);
      setTimeout(async () => {
        navigate('/home', { replace: true });
      }, 500);
    },
    onError: (err) => {
      setAction(null);
      setError(`Ошибка дропа CA: ${err.message}`);
    },
    onSettled: () => {
      setAction(null);
    }
  });

  const handleToggle = useCallback(async () => {
    setError(null);
    if (enabled) {
      setAction("stop");
      await mutationStop.mutateAsync();
    } else {
      setAction("restart");
      await mutationRestart.mutateAsync();
    }
  }, [enabled, mutationRestart, mutationStop]);

  const handleDrop = useCallback(async () => {
    setConfirmDialog({
      visible: true,
      title: "Удалить CA?",
      message: `Вы уверены, что хотите удалить CA "${caData?.ca || caId}"?`,
      onConfirm: async () => {
        setAction("drop");
        await mutationDrop.mutateAsync();
      },
    });
  }, [mutationDrop, caData, caId]);

  const isMutating = mutationStop.isPending || mutationRestart.isPending || mutationDrop.isPending;

  if (isMutating) {
    const loadingText =
      action === "stop" ? "Останавливаем CA..." : 
      action === "restart" ? "Перезапускаем CA..." :
      "Выполняем DROP CA...";
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p className={styles.loadingText}>{loadingText}</p>
      </div>
    );
  }

  if (caPending) return <div className={styles.loading}>Загрузка...</div>;
  if (caError || !caData) return <div className={styles.error}>Сертификат не найден</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Управление Fabric CA: {caData?.hostname || caData?.id || 'Неизвестный'}</h1>

        <div className={styles.controlsRow}>
          <div className={styles.switchRow}>
            <Switch checked={enabled} onChange={handleToggle} />
          </div>
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

      <div className={styles.footerButton}>
        <button 
          className={styles.dropButton} 
          onClick={handleDrop}
          disabled={isMutating}
        >
          <img src={deleteIconUrl} alt="delete icon" />
        </button>
      </div>

      <ConfirmDialog
        visible={confirmDialog.visible}
        onClose={() => setConfirmDialog({ ...confirmDialog, visible: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText="Удалить"
        cancelText="Отмена"
        variant="danger"
      />
    </div>
  );
}