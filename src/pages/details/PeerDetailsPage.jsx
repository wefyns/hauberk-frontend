import React, { useCallback, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Switch } from "../../components/switch/Switch";
import { ConfirmDialog } from "../../components/confirm-dialog/ConfirmDialog";

import { agentService, organizationService } from "../../services";
import { useOrganization } from "../../contexts/useOrganization";

import deleteIconUrl from '../../assets/images/delete.svg'

import styles from './DetailsPage.module.css';

export function PeerDetailsPage() {
  const { agentId, peerId } = useParams();
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
    data: peerData, 
    isPending: peerPending, 
    isError: peerError,
  } = useQuery({
    queryKey: ['peer', selectedOrganization?.id, agentId, peerId],
    queryFn: async () => {
      const data = await agentService.getPeer(selectedOrganization?.id, parseInt(agentId), peerId);
      return data;
    },
    enabled: !!selectedOrganization?.id && !!agentId && !!peerId,
  });
  console.log('peerData', peerData)
  const { data: organizationsData } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => organizationService.getOrganizations(),
    enabled: !!peerData?.organization_id,
  });

  const organization = organizationsData?.organizations?.find(
    org => org.id === peerData?.organization_id
  );

  useEffect(() => {
    // if (peerData?.status === 'running' || peerData?.status === 'deployed') {
    if (peerData?.status === 'running') {
      setEnabled(true);
    } else {
      setEnabled(false);
    }
  }, [peerData]);

  const mutationStop = useMutation({
    mutationFn: () => agentService.enrollPeerStop(selectedOrganization?.id, agentId, peerId),
    onSuccess: async () => {
      setEnabled(false);
      await queryClient.invalidateQueries([
        "peer",
        selectedOrganization?.id,
        agentId,
        peerId,
      ]);
    },
    onError: (err) => {
      setAction(null);
      setError(`Ошибка остановки пира: ${err.message}`);
    },
    onSettled: () => {
      setAction(null);
    }
  })

  const mutationRestart = useMutation({
    mutationFn: () => agentService.enrollPeerRestart(selectedOrganization?.id, agentId, peerId),
    onSuccess: async () => {
      setEnabled(true);
      await queryClient.invalidateQueries([
        "peer",
        selectedOrganization?.id,
        agentId,
        peerId,
      ]);
    },
    onError: (err) => {
      setAction(null);
      setError(`Ошибка перезапуска пира: ${err.message}`);
    },
    onSettled: () => {
      setAction(null);
    }
  })

  const mutationDrop = useMutation({
    mutationFn: () => {
      const peerIndexMatch = peerData?.peer?.match(/\d+$/);
      const peerIndex = peerIndexMatch ? parseInt(peerIndexMatch[0], 10) : null;

      if (peerIndex === null || isNaN(peerIndex)) {
        throw new Error("Некорректное имя пира — не удалось определить индекс");
      }

      agentService.enrollPeerDrop(selectedOrganization?.id, agentId, peerIndex)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries([
        "peer",
        selectedOrganization?.id,
        agentId,
        peerId,
      ]);
      setTimeout(async () => {
        navigate('/home', { replace: true })
      })
    },
    onError: (err) => {
      setAction(null);
      setError(`Ошибка дропа пира: ${err.message}`);
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
      await mutationRestart.mutateAsync(undefined)
    }
  }, [enabled, mutationRestart, mutationStop])

  const handleDrop = useCallback(async () => {
    setConfirmDialog({
      visible: true,
      title: "Удалить Peer?",
      message: `Вы уверены, что хотите удалить peer "${peerData?.peer || peerId}"?`,
      onConfirm: async () => {
        setAction("drop");
        await mutationDrop.mutateAsync(undefined);
      },
    });
  }, [mutationDrop, peerData, peerId])

  const isMutating = mutationStop.isPending || mutationRestart.isPending || mutationDrop.isPending;

  if (isMutating) {
    const loadingText =
      action === "stop" ? "Останавливаем Peer..." : 
      action === "restart" ? "Перезапускаем Peer..." :
      "Выполняем DROP Peer...";
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p className={styles.loadingText}>{loadingText}</p>
      </div>
    );
  }

  if (peerPending) return <div className={styles.loading}>Загрузка...</div>;
  if (peerError || !peerData) return <div className={styles.error}>Пир не найден</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Управление пиром: {peerData.peer || peerData.id || 'Неизвестный'}</h1>

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
          <span className={styles.value}>{peerData.id || '—'}</span>
        </div>
        
        <div className={styles.infoRow}>
          <span className={styles.label}>MSP ID:</span>
          <span className={styles.value}>{peerData.msp_id || '—'}</span>
        </div>
        
        <div className={styles.infoRow}>
          <span className={styles.label}>Version:</span>
          <span className={styles.value}>{peerData.version || '—'}</span>
        </div>
        
        <div className={styles.infoRow}>
          <span className={styles.label}>Status:</span>
          <span className={styles.value}>{peerData.status || '—'}</span>
        </div>
        
        <div className={styles.infoRow}>
          <span className={styles.label}>Domain:</span>
          <span className={styles.value}>{peerData.domain_name || '—'}</span>
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