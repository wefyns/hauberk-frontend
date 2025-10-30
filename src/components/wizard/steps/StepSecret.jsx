import React, { useEffect, useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";

import { secretService } from "../../../services";

import styles from "./Steps.module.css";


export function StepSecret({ registerSubmit, isSubmitting, orgId }) {
  const [error, setError] = useState(null);
  const [secretCreated, setSecretCreated] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      secret_mark: "",
      secret_value: "",
      secret_type: "AGENT_PASSWORD",
    },
  });

  const createSecretMutation = useMutation({
    mutationFn: (payload) => secretService.addSecret(parseInt(orgId), payload),
    onError: (err) => {
      setError(err.message || "Ошибка при создании секрета");
    },
  });

  const onSubmit = useCallback(async (data) => {
    try {
      setError(null);
      
      const payload = {
        secret_mark: data.secret_mark,
        secret_value: data.secret_value,
        secret_type: data.secret_type,
      };

      const result = await createSecretMutation.mutateAsync(payload);
      setSecretCreated(true);
      
      return {
        success: true,
        meta: {
          secretId: result.id || result.secret?.id,
          secretData: result
        }
      };
    } catch (err) {
      return {
        success: false,
        error: err.message || "Не удалось создать секрет"
      };
    }
  }, [createSecretMutation]);

  const submitWrapper = useCallback(async () => {
    if (secretCreated) {
      return {
        success: true,
        meta: {
          secretId: null,
          secretData: null
        }
      };
    }

    return new Promise((resolve) => {
      handleSubmit(async (data) => {
        const result = await onSubmit(data);
        resolve(result);
      }, (errors) => {
        console.error("Secret form validation errors:", errors);
        resolve({
          success: false,
          error: "Проверьте корректность заполнения всех полей секрета"
        });
      })();
    });
  }, [handleSubmit, onSubmit, secretCreated]);

  useEffect(() => {
    if (orgId) {
      registerSubmit(submitWrapper);
    }
  }, [registerSubmit, submitWrapper, orgId]);

  if (!orgId) {
    return (
      <div className={styles.stepContainer}>
        <div className={styles.stepContent}>
          <div className={styles.errorMessage}>
            Ошибка: Сначала необходимо создать организацию
          </div>
        </div>
      </div>
    );
  }

  if (secretCreated) {
    return (
      <div className={styles.stepContainer}>
        <div className={styles.stepContent}>
          <div className={styles.successState}>
            <h3 className={styles.successTitle}>Секрет создан</h3>
            <p className={styles.successDescription}>
              Секрет безопасности успешно создан и будет использован для защиты доступа к агентам.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.stepContainer}>
      <div className={styles.stepContent}>
        <h2 className={styles.stepTitle}>Создание секрета</h2>

        {error && (
          <div className={styles.errorMessage}>
            <p>{error}</p>
          </div>
        )}

        <div className={styles.formContainer}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="secret_mark" className={styles.label}>
                Секретный знак *
              </label>
              <input
                type="text"
                id="secret_mark"
                className={styles.input}
                disabled={isSubmitting}
                {...register("secret_mark", {
                  required: "Требуется секретная знак",
                })}
              />
              {errors.secret_mark && (
                <span className={styles.fieldError}>{errors.secret_mark.message}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="secret_type" className={styles.label}>
                Тип секрета *
              </label>
              <input
                id="secret_type"
                className={styles.input}
                {...register("secret_type", {
                  required: "Требуется ввести тип секрета",
                })}
              />
              {errors.secret_type && (
                <span className={styles.fieldError}>{errors.secret_type.message}</span>
              )}
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup} style={{ gridColumn: "1 / -1" }}>
              <label htmlFor="secret_value" className={styles.label}>
                Значение секрета *
              </label>
              <input
                type="password"
                id="secret_value"
                className={styles.input}
                disabled={isSubmitting}
                {...register("secret_value", {
                  required: "Требуется указать значение секрета",
                })}
              />
              {errors.secret_value && (
                <span className={styles.fieldError}>{errors.secret_value.message}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}