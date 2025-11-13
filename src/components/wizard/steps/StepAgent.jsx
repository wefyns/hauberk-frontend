import React, { useEffect, useCallback, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation } from "@tanstack/react-query";

import { secretService, agentService } from "../../../services";

import styles from "./Steps.module.css";

export function StepAgent({ registerSubmit, isSubmitting, orgId, agentId }) {
  const [error, setError] = useState(null);
  const [agentCreated, setAgentCreated] = useState(false);
  const submitWrapperRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    defaultValues: {
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
    if (secrets.length > 0 && !isSubmitting) {
      setValue("secret_id", secrets[0].id.toString());
    }
  }, [secrets, setValue, isSubmitting]);

  const createAgentMutation = useMutation({
    mutationFn: (payload) => agentService.addAgent(parseInt(orgId), payload),
    onError: (err) => {
      setError(err.message || "Ошибка при создании агента");
    },
  });

  const onSubmit = useCallback(async (data) => {
    try {
      setError(null);
      
      const payload = {
        ...data,
        port: Number(data.port),
        secret_id: data.secret_id ? Number(data.secret_id) : null,
      };

      const result = await createAgentMutation.mutateAsync(payload);
      setAgentCreated(true);
      
      return {
        success: true,
        meta: {
          agentId: result.id || result.agent?.id,
          agentData: result
        }
      };
    } catch (err) {
      return {
        success: false,
        error: err.message || "Не удалось создать агента"
      };
    }
  }, [createAgentMutation]);

  const submitWrapper = useCallback(async () => {
    if (agentCreated || agentId) {
      return {
        success: true,
        meta: {
          agentId: agentId || null,
          agentData: null
        }
      };
    }

    return new Promise((resolve) => {
      handleSubmit(async (data) => {
        const result = await onSubmit(data);
        resolve(result);
      }, (errors) => {
        console.error("Agent form validation errors:", errors);
        resolve({
          success: false,
          error: "Проверьте корректность заполнения всех полей агента"
        });
      })();
    });
  }, [handleSubmit, onSubmit, agentCreated, agentId]);

  useEffect(() => {
    submitWrapperRef.current = submitWrapper;
  }, [submitWrapper]);

  useEffect(() => {
    if (orgId && !secretsLoading) {
      registerSubmit(() => submitWrapperRef.current());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId, secretsLoading]);

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

  if (agentCreated || agentId) {
    return (
      <div className={styles.stepContainer}>
        <div className={styles.stepContent}>
          <div className={styles.successState}>
            <h3 className={styles.successTitle}>Агент создан</h3>
          </div>
        </div>
      </div>
    );
  }

  if (!secretsLoading && secrets.length === 0) {
    return (
      <div className={styles.stepContainer}>
        <div className={styles.stepContent}>
          <div className={styles.errorMessage}>
            Нет доступных секретов для создания агента. Вернитесь к предыдущему шагу и создайте секрет.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.stepContainer}>
      <div className={styles.stepContent}>
        <h2 className={styles.stepTitle}>Создание агента</h2>

        {error && (
          <div className={styles.errorMessage}>
            <p>{error}</p>
          </div>
        )}

        {secretsLoading && (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <p>Загрузка секретов...</p>
          </div>
        )}

        {!secretsLoading && (
          <div className={styles.formContainer}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="uuid" className={styles.label}>
                  UUID агента *
                </label>
                <input
                  id="uuid"
                  type="text"
                  className={styles.input}
                  disabled={isSubmitting}
                  placeholder="например, agent-123e4567-e89b-12d3-a456-426614174000"
                  {...register("uuid", { 
                    required: "Требуется UUID агента",
                  })}
                />
                {errors.uuid && (
                  <span className={styles.fieldError}>{errors.uuid.message}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="secret_id" className={styles.label}>
                  Секрет *
                </label>
                <select
                  id="secret_id"
                  className={styles.input}
                  disabled={isSubmitting || secrets.length === 0}
                  {...register("secret_id", { required: "Секрет обязателен" })}
                >
                  <option value="">Выберите секрет</option>
                  {secrets.map((secret) => (
                    <option key={secret.id} value={secret.id}>
                      {secret.secret_mark} ({secret.secret_type})
                    </option>
                  ))}
                </select>
                {errors.secret_id && (
                  <span className={styles.fieldError}>{errors.secret_id.message}</span>
                )}
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="protocol" className={styles.label}>
                  Протокол соединения
                </label>
                <select 
                  id="protocol" 
                  className={styles.input} 
                  disabled={isSubmitting}
                  {...register("protocol")}
                >
                  <option value="https">HTTPS</option>
                  <option value="http">HTTP</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="host" className={styles.label}>
                  Хост *
                </label>
                <input
                  id="host"
                  type="text"
                  className={styles.input}
                  disabled={isSubmitting}
                  placeholder="example.com или 192.168.1.100"
                  {...register("host", { 
                    required: "Требуется указать хост",
                  })}
                />
                {errors.host && (
                  <span className={styles.fieldError}>{errors.host.message}</span>
                )}
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="port" className={styles.label}>
                  Порт *
                </label>
                <input
                  id="port"
                  type="number"
                  className={styles.input}
                  disabled={isSubmitting}
                  {...register("port", {
                    required: "Требуется указать порт",
                    valueAsNumber: true
                  })}
                />
                {errors.port && (
                  <span className={styles.fieldError}>{errors.port.message}</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}