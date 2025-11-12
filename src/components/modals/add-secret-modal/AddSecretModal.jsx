import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";

import { Dialog } from "../../dialog/Dialog";
import { secretService } from "../../../services";
import { useOrganization } from "../../../contexts/useOrganization";

import styles from "./AddSecretModal.module.css";

export default function AddSecretModal({ visible, onClose, orgId, editingSecret, onSuccess }) {
  const { organizations, selectedOrganization } = useOrganization();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      organization_id: "",
      secret_mark: "",
      secret_value: "",
      secret_type: "AGENT_PASSWORD",
    },
  });

  useEffect(() => {
    if (visible) {
      setValue("organization_id", selectedOrganization?.id?.toString() || orgId?.toString() || "");
      
      if (editingSecret) {
        setValue("secret_mark", editingSecret.secret_mark ?? "");
        setValue("secret_type", editingSecret.secret_type ?? "AGENT_PASSWORD");
      }
    }
    if (!visible) {
      reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, editingSecret, selectedOrganization, orgId]);

  const createMutation = useMutation({
    mutationFn: ({ orgId, secretId, payload }) => {
      if (secretId) {
        return secretService.updateSecret(orgId, secretId, payload);
      }
      return secretService.addSecret(orgId, payload);
    },
    onSuccess: () => {
      reset();
      onSuccess?.();
      onClose?.("custom");
    },
    onError: (err) => {
      console.error("addSecret/updateSecret error:", err);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ orgId, secretId }) => {
      return secretService.deleteSecret(orgId, secretId);
    },
    onSuccess: () => {
      reset();
      onSuccess?.();
      onClose?.("custom");
    },
    onError: (err) => {
      console.error("deleteSecret error:", err);
    },
  });

  const onSubmit = async (data) => {
    const selectedOrgId = parseInt(data.organization_id);
    
    const payload = {
      secret_mark: data.secret_mark,
      secret_type: data.secret_type,
    };

    if (data.secret_value) {
      payload.secret_value = data.secret_value;
    }

    try {
      await createMutation.mutateAsync({ 
        orgId: selectedOrgId, 
        secretId: editingSecret?.id || null,
        payload 
      });
    } catch (err) {
      return { error: err.message || "Failed to add/update secret" };
    }
  };

  const handleDelete = () => {
    if (!editingSecret?.id) return;

    const orgId = parseInt(editingSecret.organization_id || selectedOrganization?.id);
    deleteMutation.mutate({ orgId, secretId: editingSecret.id });
  };

  const isPending = createMutation.isPending || deleteMutation.isPending;

  return (
    <Dialog
      visible={visible}
      onClose={(reason) => onClose?.(reason)}
      title={editingSecret ? "Редактировать секрет" : "Добавить секрет"}
      width="medium"
      height="auto"
      position="center"
      backdropVariant="blur"
      footerButtons={null}
    >
      <div className={styles.container}>
        <form onSubmit={handleSubmit(onSubmit)}>
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
            <label htmlFor="secret_mark" className={styles.label}>Секретный знак *</label>
            <input
              type="text"
              id="secret_mark"
              className={styles.input}
              {...register("secret_mark", {
                required: "Требуется секретная знак",
              })}
            />
            {errors.secret_mark && <span className={styles.error}>{errors.secret_mark.message}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="secret_value" className={styles.label}>
              Значение секрета *
            </label>
            <input
              type="password"
              id="secret_value"
              className={styles.input}
              {...register("secret_value", {
                required: editingSecret ? false : "Требуется указать значение секрета",
              })}
              placeholder={editingSecret ? "Новое значение секрета" : ""}
            />
            {errors.secret_value && <span className={styles.error}>{errors.secret_value.message}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="secret_type" className={styles.label}>Тип секрета *</label>
            <input
              id="secret_type"
              className={styles.input}
              {...register("secret_type", {
                required: "Требуется ввести тип секрета",
              })}
            />
            {errors.secret_type && <span className={styles.error}>{errors.secret_type.message}</span>}
          </div>

          {createMutation.isError && (
            <div className={styles.serverError}>
              {createMutation.error?.message || "Ошибка сервера при сохранении секрета"}
            </div>
          )}

          {deleteMutation.isError && (
            <div className={styles.serverError}>
              {deleteMutation.error?.message || "Ошибка сервера при удалении секрета"}
            </div>
          )}

          <div className={styles.actions}>
            {editingSecret && (
              <button 
                type="button" 
                className={styles.dangerButton} 
                onClick={handleDelete} 
                disabled={isPending}
              >
                {deleteMutation.isPending ? "Удаление..." : "Удалить секрет"}
              </button>
            )}

            <div style={{ flex: 1 }} />

            <button type="button" className={styles.cancelButton} onClick={() => onClose?.("custom")} disabled={isPending}>
              Отменить
            </button>
            <button type="submit" className={styles.submitButton} disabled={isSubmitting || isPending}>
              {isPending ? (editingSecret ? "Сохранение..." : "Добавление...") : (editingSecret ? "Сохранить" : "Добавить секрет")}
            </button>
          </div>
        </form>
      </div>
    </Dialog>
  );
}