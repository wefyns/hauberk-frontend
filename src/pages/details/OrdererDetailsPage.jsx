import React, { useCallback, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Switch } from "../../components/switch/Switch";
import { ConfirmDialog } from "../../components/confirm-dialog/ConfirmDialog";

import { agentService, organizationService } from "../../services";
import { useOrganization } from "../../contexts/useOrganization";

import deleteIconUrl from '../../assets/images/delete.svg'

import styles from './DetailsPage.module.css';

export function OrdererDetailsPage() {
  const { agentId, ordererId } = useParams();
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
    if (ordererData?.status === 'running') {
      setEnabled(true);
    } else {
      setEnabled(false);
    }
  }, [ordererData]);

  const mutationStop = useMutation({
    mutationFn: () => agentService.enrollOrdererStop(selectedOrganization?.id, agentId, ordererId),
    onSuccess: async () => {
      setEnabled(false);
      await queryClient.invalidateQueries([
        "orderer",
        selectedOrganization?.id,
        agentId,
        ordererId,
      ]);
    },
    onError: (err) => {
      setAction(null);
      setError(`Ошибка остановки orderer: ${err.message}`);
    },
    onSettled: () => {
      setAction(null);
    }
  })

  const mutationRestart = useMutation({
    mutationFn: () => agentService.enrollOrdererRestart(selectedOrganization?.id, agentId, ordererId),
    onSuccess: async () => {
      setEnabled(true);
      await queryClient.invalidateQueries([
        "orderer",
        selectedOrganization?.id,
        agentId,
        ordererId,
      ]);
    },
    onError: (err) => {
      setAction(null);
      setError(`Ошибка перезапуска orderer: ${err.message}`);
    },
    onSettled: () => {
      setAction(null);
    }
  })

  const mutationDrop = useMutation({
    mutationFn: () => agentService.enrollOrdererDrop(selectedOrganization?.id, agentId, ordererId),
    onSuccess: async () => {
      await queryClient.invalidateQueries([
        "orderer",
        selectedOrganization?.id,
        agentId,
        ordererId,
      ]);
      setTimeout(async () => {
        navigate('/home', { replace: true });
      }, 500);
    },
    onError: (err) => {
      setAction(null);
      setError(`Ошибка дропа orderer: ${err.message}`);
    },
    onSettled: () => {
      setAction(null);
    }
  })

  const handleToggle = useCallback(async () => {
    if (enabled) {
      setAction("stop");
      await mutationStop.mutateAsync(undefined);
    } else {
      setAction("restart");
      await mutationRestart.mutateAsync(undefined);
    }
  }, [enabled, mutationRestart, mutationStop])

  const handleDrop = useCallback(async () => {
    setConfirmDialog({
      visible: true,
      title: "Удалить Orderer?",
      message: `Вы уверены, что хотите удалить orderer "${ordererData?.orderer || ordererId}"?`,
      onConfirm: async () => {
        setAction("drop");
        await mutationDrop.mutateAsync(undefined);
      },
    });
  }, [mutationDrop, ordererData, ordererId])

  const isMutating = mutationStop.isPending || mutationRestart.isPending || mutationDrop.isPending;

  if (isMutating) {
    const loadingText =
      action === "stop" ? "Останавливаем Orderer..." : 
      action === "restart" ? "Перезапускаем Orderer..." :
      "Выполняем DROP Orderer...";
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p className={styles.loadingText}>{loadingText}</p>
      </div>
    );
  }

  if (ordererPending) return <div className={styles.loading}>Загрузка...</div>;
  if (ordererError || !ordererData) return <div className={styles.error}>Orderer не найден</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Управление Orderer: {ordererData.host_name || ordererData.id || 'Неизвестный'}</h1>

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
          <span className={styles.value}>{ordererData.local ? 'Да' : 'Нет'}</span>
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
