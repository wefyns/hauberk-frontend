import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";

import { Dialog } from "../../dialog/Dialog";
import { secretService } from "../../../services";

import styles from "./AddSecretModal.module.css";

export default function AddSecretModal({ visible, onClose, orgId, editingSecret, onSuccess }) {

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      secret_mark: "",
      secret_value: "",
      secret_type: "AGENT_PASSWORD",
    },
  });

  useEffect(() => {
    if (visible && editingSecret) {
      setValue("secret_mark", editingSecret.secret_mark ?? "");
      setValue("secret_type", editingSecret.secret_type ?? "AGENT_PASSWORD");
    }
    if (!visible) {
      reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, editingSecret]);

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
            <label htmlFor="secret_mark">Секретный знак *</label>
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
            <label htmlFor="secret_value">Секретное значение *</label>
            <input
              type="password"
              id="secret_value"
              className={styles.input}
              {...register("secret_value", {
                required: editingSecret ? false : "Требуется секретное значение",
              })}
            />
            {errors.secret_value && <span className={styles.error}>{errors.secret_value.message}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="secret_type">Секретный тип *</label>
            <input
              id="secret_type"
              className={styles.input}
              {...register("secret_type", {
                required: "Требуется ввести секретный тип",
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