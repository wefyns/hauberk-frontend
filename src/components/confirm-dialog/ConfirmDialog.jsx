import React from "react";
import { Dialog } from "../dialog/Dialog";
import styles from "./ConfirmDialog.module.css";

export function ConfirmDialog({
  visible,
  onClose,
  onConfirm,
  title = "Подтверждение",
  message = "Вы уверены?",
  confirmText = "Да",
  cancelText = "Отмена",
  variant = "danger",
}) {
  const handleConfirm = () => {
    onConfirm?.();
    onClose?.();
  };

  const handleCancel = () => {
    onClose?.();
  };

  return (
    <Dialog
      visible={visible}
      onClose={handleCancel}
      title={title}
      width="small"
      height="auto"
      position="center"
      backdropVariant="blur"
      footerButtons={null}
    >
      <div className={styles.container}>
        <div className={styles.message}>{message}</div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={handleCancel}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`${styles.confirmButton} ${styles[variant]}`}
            onClick={handleConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Dialog>
  );
}
