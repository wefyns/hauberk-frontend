import React, { useEffect } from "react";

import { useForm } from "react-hook-form";
import { useQuery, useMutation } from "@tanstack/react-query";

import { secretService } from "../../../services";
import { useOrganization } from "../../../contexts/useOrganization";

import { Dialog } from "../../dialog/Dialog";
import { agentService } from "../../../services";
import styles from "./AddAgentModal.module.css";

export default function AddAgentModal({ visible, onClose, orgId, onSuccess, editingAgent }) {
  const { organizations, selectedOrganization } = useOrganization();
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      organization_id: "",
      uuid: "",
      secret_id: "",
      protocol: "https",
      host: "",
      port: 8081,
    },
  });

  const { data: secrets = [], isLoading: secretsLoading } = useQuery({
    queryKey: ["secrets", orgId],
    queryFn: () => secretService.getSecrets(),
    enabled: !!orgId,
    select: (data) => data?.secrets || [],
  });

  useEffect(() => {
    if (visible) {
      setValue("organization_id", selectedOrganization?.id?.toString() || orgId?.toString() || "");
    }
    
    if (editingAgent) {
      reset({
        organization_id: selectedOrganization?.id?.toString() || orgId?.toString() || "",
        uuid: editingAgent.uuid ?? "",
        secret_id: editingAgent.secret_id != null ? String(editingAgent.secret_id) : "",
        protocol: editingAgent.protocol ?? "https",
        host: editingAgent.host ?? "",
        port: editingAgent.port ?? 8081,
      });
    } else if (!visible) {
      reset({
        organization_id: "",
        uuid: "",
        secret_id: "",
        protocol: "https",
        host: "",
        port: 8081,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingAgent, visible, selectedOrganization, orgId]);

  const mutation = useMutation({
    mutationFn: ({ orgId, agentId, payload }) => {
      if (agentId) {
        return agentService.updateAgent(orgId, agentId, payload);
      }
      return agentService.addAgent(orgId, payload);
    },
    onSuccess: () => {
      onSuccess?.();
      onClose?.("custom");
      reset({
        organization_id: "",
        uuid: "",
        secret_id: "",
        protocol: "https",
        host: "",
        port: 8081,
      });
    },
    onError: (err) => {
      console.error("add/update agent failed:", err);
    },
  });

  const onSubmit = (data) => {
    const selectedOrgId = parseInt(data.organization_id);
    
    const payload = {
      uuid: data.uuid,
      secret_id: data.secret_id ? Number(data.secret_id) : null,
      protocol: data.protocol,
      host: data.host,
      port: Number(data.port),
    };
    
    mutation.mutate({ 
      orgId: selectedOrgId, 
      agentId: editingAgent?.id || null,
      payload 
    });
  };

  const title = editingAgent ? `Редактировать агента — ${editingAgent.uuid || editingAgent.id}` : "Добавить агента";
  const submitLabel = editingAgent ? (mutation.isLoading ? "Обновление..." : "Обновить агента") : (mutation.isLoading ? "Создание..." : "Создать агента");

  return (
    <Dialog
      visible={visible}
      onClose={(reason) => onClose?.(reason)}
      title={title}
      width="medium"
      height="auto"
      position="center"
      backdropVariant="blur"
      footerButtons={null}
    >
      <div className={styles.container}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className={styles.formGroup}>
            <label htmlFor="organization_id" className={styles.label}>Организация *</label>
            <select
              id="organization_id"
              className={styles.input}
              {...register("organization_id", { required: "Выберите организацию" })}
            >
              <option value="">Выберите организацию</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
            {errors.organization_id && <span className={styles.error}>{errors.organization_id.message}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="uuid" className={styles.label}>UUID агента *</label>
            <input
              id="uuid"
              type="text"
              className={styles.input}
              {...register("uuid", { required: "Требуется UUID агента" })}
              placeholder="например, agent-123e4567-e89b-12d3-a456-426614174000"
            />
            {errors.uuid && <span className={styles.error}>{errors.uuid.message}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="secret_id" className={styles.label}>Секрет *</label>
            <select
              id="secret_id"
              className={styles.input}
              {...register("secret_id", { required: "Секрет обязателен" })}
              disabled={secretsLoading || secrets?.length === 0}
            >
              <option value="">Выберите секрет</option>
              {secrets?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} (ID: {s.id} - {s.secret_mark} - {s.secret_type})
                </option>
              ))}
            </select>
            {errors.secret_id && <span className={styles.error}>{errors.secret_id.message}</span>}
            {secrets?.length === 0 && !secretsLoading && (
              <p className={styles.formHelp}>Секретов нет. Пожалуйста, сначала добавьте секрет.</p>
            )}
            {secretsLoading && <p className={styles.formHelp}>Закгрузка секретов...</p>}
          </div>

          <div className={styles.formRow}>
            <div className={styles.column}>
              <div className={styles.formGroup}>
                <label htmlFor="protocol" className={styles.label}>Протокол соединения</label>
                <select id="protocol" className={styles.input} {...register("protocol")}>
                  <option value="https">HTTPS</option>
                  <option value="http">HTTP</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="host" className={styles.label}>Хост *</label>
                <input
                  id="host"
                  type="text"
                  className={styles.input}
                  {...register("host", { required: "Требуется указать хост" })}
                  placeholder="например, example.com или 192.168.1.1"
                />
                {errors.host && <span className={styles.error}>{errors.host.message}</span>}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="port" className={styles.label}>Порт *</label>
              <input
                id="port"
                type="number"
                className={styles.input}
                {...register("port", {
                  required: "Требуется порт",
                  min: { value: 1, message: "Порт должен быть не менее 1" },
                  max: { value: 65535, message: "Порт должен быть не более 65535" },
                })}
              />
              {errors.port && <span className={styles.error}>{errors.port.message}</span>}
            </div>
          </div>

          {mutation.isError && (
            <div className={styles.serverError}>
              {mutation.error?.message || "Ошибка сервера при сохранении агента"}
            </div>
          )}

          <div className={styles.actions}>
            <div style={{ flex: 1 }} />

            <button
              type="button"
              className={styles.ghost}
              onClick={() => {
                reset();
                onClose?.("custom");
              }}
              disabled={mutation.isLoading}
            >
              Отменить
            </button>

            <button 
              type="submit" 
              className={styles.primary} 
              disabled={mutation.isLoading}
            >
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </Dialog>
  );
}