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
    mutationFn: (payload) => secretService.addSecret(parseInt(orgId), payload),
    onSuccess: () => {
      reset();
      onSuccess?.();
      onClose?.("custom");
    },
    onError: (err) => {
      console.error("addSecret error:", err);
    },
  });

  const onSubmit = async (data) => {
    const payload = {
      secret_mark: data.secret_mark,
      secret_value: data.secret_value,
      secret_type: data.secret_type,
    };

    try {
      await createMutation.mutateAsync(payload);
    } catch (err) {
      return { error: err.message || "Failed to add secret" };
    }
  };

  const isPending = createMutation.isPending;

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
            <label htmlFor="organization_id" className={styles.label}>Организация</label>
            <select
              id="organization_id"
              className={styles.input}
              disabled
              {...register("organization_id")}
            >
              <option value="">Выберите организацию</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
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
            <label htmlFor="secret_value" className={styles.label}>Значение секрета *</label>
            <input
              type="password"
              id="secret_value"
              className={styles.input}
              {...register("secret_value", {
                required: editingSecret ? false : "Требуется указать значение секрета",
              })}
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

          <div className={styles.actions}>
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