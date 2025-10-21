import React, { useEffect } from "react";

import { useForm } from "react-hook-form";
import { useQuery, useMutation } from "@tanstack/react-query";

import { secretService } from "../../../services";

import { Dialog } from "../../dialog/Dialog";
import { agentService } from "../../../services";
import styles from "./AddAgentModal.module.css";

export default function AddAgentModal({ visible, onClose, orgId, onSuccess, editingAgent }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      uuid: "",
      secret_id: "",
      protocol: "https",
      host: "",
      port: 8443,
    },
  });

  const { data: secrets = [], isLoading: secretsLoading } = useQuery({
    queryKey: ["secrets", orgId],
    queryFn: () => secretService.getSecrets(parseInt(orgId)),
    enabled: !!orgId,
    select: (data) => data?.secrets || [],
  });

  useEffect(() => {
    if (editingAgent) {
      reset({
        uuid: editingAgent.uuid ?? "",
        secret_id: editingAgent.secret_id != null ? String(editingAgent.secret_id) : "",
        protocol: editingAgent.protocol ?? "https",
        host: editingAgent.host ?? "",
        port: editingAgent.port ?? 8443,
      });
    } else if (!visible) {
      reset({
        uuid: "",
        secret_id: "",
        protocol: "https",
        host: "",
        port: 8443,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingAgent, visible]);

  const mutation = useMutation({
    mutationFn: (payload) => {
      return agentService.addAgent(parseInt(orgId), payload);
    },
    onSuccess: () => {
      onSuccess?.();
      onClose?.("custom");
      reset({
        uuid: "",
        secret_id: "",
        protocol: "https",
        host: "",
        port: 8443,
      });
    },
    onError: (err) => {
      console.error("add/update agent failed:", err);
    },
  });

  const onSubmit = (data) => {
    const payload = {
      ...data,
      port: Number(data.port),
      secret_id: data.secret_id ? Number(data.secret_id) : null,
    };
    mutation.mutate(payload);
  };

  const title = editingAgent ? `Edit Agent — ${editingAgent.uuid || editingAgent.id}` : "Add Agent";
  const submitLabel = editingAgent ? (mutation.isLoading ? "Updating..." : "Update Agent") : (mutation.isLoading ? "Creating..." : "Create Agent");

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
            <label htmlFor="uuid">Agent UUID *</label>
            <input
              id="uuid"
              type="text"
              className={styles.input}
              {...register("uuid", { required: "Agent UUID is required" })}
              placeholder="e.g., agent-123e4567-e89b-12d3-a456-426614174000"
            />
            {errors.uuid && <span className={styles.error}>{errors.uuid.message}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="secret_id">Secret *</label>
            <select
              id="secret_id"
              className={styles.input}
              {...register("secret_id", { required: "Secret is required" })}
              disabled={secretsLoading || secrets?.length === 0}
            >
              <option value="">Select a secret</option>
              {secrets?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} (ID: {s.id} - {s.secret_mark} - {s.secret_type})
                </option>
              ))}
            </select>
            {errors.secret_id && <span className={styles.error}>{errors.secret_id.message}</span>}
            {secrets?.length === 0 && !secretsLoading && (
              <p className={styles.formHelp}>No secrets available. Please add a secret first.</p>
            )}
            {secretsLoading && <p className={styles.formHelp}>Loading secrets...</p>}
          </div>

          <div className={styles.formRow}>
            <div className={styles.column}>
              <div className={styles.formGroup}>
                <label htmlFor="protocol">Protocol</label>
                <select id="protocol" className={styles.input} {...register("protocol")}>
                  <option value="https">HTTPS</option>
                  <option value="http">HTTP</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="host">Host *</label>
                <input
                  id="host"
                  type="text"
                  className={styles.input}
                  {...register("host", { required: "Host is required" })}
                  placeholder="e.g., example.com or 192.168.1.1"
                />
                {errors.host && <span className={styles.error}>{errors.host.message}</span>}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="port">Port *</label>
              <input
                id="port"
                type="number"
                className={styles.input}
                {...register("port", {
                  required: "Port is required",
                  min: { value: 1, message: "Port must be at least 1" },
                  max: { value: 65535, message: "Port must be at most 65535" },
                })}
              />
              {errors.port && <span className={styles.error}>{errors.port.message}</span>}
            </div>
          </div>

          {mutation.isError && (
            <div className={styles.serverError}>
              {mutation.error?.message || "Server error while saving agent"}
            </div>
          )}

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.ghost}
              onClick={() => {
                reset();
                onClose?.("custom");
              }}
              disabled={mutation.isLoading}
            >
              Cancel
            </button>

            <button type="submit" className={styles.primary} disabled={mutation.isLoading}>
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </Dialog>
  );
}