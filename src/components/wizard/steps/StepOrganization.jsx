import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";

import { COUNTRIES } from '../../../constants/data';
import { Select } from "../../select/Select";
import { organizationService } from "../../../services/organizationService";

import styles from "./Steps.module.css";

export function StepOrganization({ registerSubmit, isSubmitting, orgId }) {
  const [error, setError] = useState(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      name: "",
      name_lat: "",
      country: "",
      country_code: "",
      region: "",
      domain: "",
      settlement: "",
      ogrn: "",
    }
  });

  const watchedCountry = watch("country", "");
  const watchedCountryCode = watch("country_code", "");

  const handleCountryChange = (item) => {
    if (!item) {
      setValue("country", "", { shouldDirty: true, shouldValidate: true });
      setValue("country_code", "", { shouldDirty: true, shouldValidate: true });
      return;
    }

    const name = item?.name ?? "";
    const code = (item?.code ?? "").toString().toUpperCase();

    setValue("country", name, { shouldDirty: true, shouldValidate: true });
    setValue("country_code", code, { shouldDirty: true, shouldValidate: true });
  };

  const createOrganizationMutation = useMutation({
    mutationFn: (data) => organizationService.createOrganization(data),
    onError: (err) => {
      setError(err.message || "Ошибка при создании организации");
    },
  });

  const onSubmit = useCallback(async (data) => {
    try {
      setError(null);
      
      if (!data.name || !data.country || !data.domain) {
        return {
          success: false,
          error: "Заполните все обязательные поля"
        };
      }
      
      const result = await createOrganizationMutation.mutateAsync(data);
    
      if (!result || (!result.id && !result.organization?.id)) {
        console.error("Unexpected API response:", result);
        return {
          success: false,
          error: "Сервер вернул некорректный ответ"
        };
      }
      
      const orgId = result.id || result.organization?.id;
      console.log("Organization created successfully:", { orgId, result });
      
      return {
        success: true,
        meta: {
          orgId: orgId,
          organizationData: result
        }
      };
    } catch (err) {
      console.error("Organization creation error:", err);
      setError(err.message || "Не удалось создать организацию");
      return {
        success: false,
        error: err.message || "Не удалось создать организацию"
      };
    }
  }, [createOrganizationMutation]);

  const submitWrapper = useCallback(async () => {
    if (orgId) {
      return {
        success: true,
        meta: {
          orgId: orgId,
          organizationData: null
        }
      };
    }

    return new Promise((resolve) => {
      handleSubmit(async (data) => {
        const result = await onSubmit(data);
        resolve(result);
      }, (errors) => {
        console.error("Form validation errors:", errors);
        resolve({
          success: false,
          error: "Проверьте корректность заполнения всех полей"
        });
      })();
    });
  }, [handleSubmit, onSubmit, orgId]);

  useEffect(() => {
    registerSubmit(submitWrapper);
  }, [registerSubmit, submitWrapper]);

  if (orgId) {
    return (
      <div className={styles.stepContainer}>
        <div className={styles.stepContent}>
          <h2 className={styles.stepTitle}>Организация создана</h2>
          <p className={styles.stepDescription}>
            Ваша организация успешно создана! Переходим к следующему шагу - настройке секрета.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.stepContainer}>
      <div className={styles.stepContent}>
        {error && (
          <div className={styles.errorMessage}>
            <p>{error}</p>
          </div>
        )}

        <div className={styles.formContainerGrid}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.label}>
                Название организации *
              </label>
              <input
                type="text"
                id="name"
                className={styles.input}
                disabled={isSubmitting}
                {...register("name", {
                  required: "Требуется указать название организации"
                })}
              />
              {errors.name && (
                <span className={styles.fieldError}>{errors.name.message}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="name_lat" className={styles.label}>
                Латинизированное название *
              </label>
              <input
                type="text"
                id="name_lat"
                className={styles.input}
                disabled={isSubmitting}
                {...register("name_lat", {
                  required: "Требуется латинизированное название"
                })}
              />
              {errors.name_lat && (
                <span className={styles.fieldError}>{errors.name_lat.message}</span>
              )}
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <Select
                data={COUNTRIES}
                label="Страна *"
                id="country"
                placeholder="Начните вводить название страны..."
                labelKey="name"
                valueKey="code"
                selected={watchedCountry}
                onChange={handleCountryChange}
                disabled={isSubmitting}
                errors={errors}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="country_code" className={styles.label}>
                Код страны *
              </label>
              <input
                type="text"
                id="country_code"
                placeholder="RU, US, GB..."
                className={styles.input}
                disabled={true}
                {...register("country_code", {
                  required: "Код страны обязателен",
                })}
                value={watchedCountryCode || ""}
              />
              {errors.country_code && (
                <span className={styles.fieldError}>{errors.country_code.message}</span>
              )}
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="region" className={styles.label}>
                Регион *
              </label>
              <input
                type="text"
                id="region"
                className={styles.input}
                disabled={isSubmitting}
                {...register("region", {
                  required: "Требуется указать регион"
                })}
              />
              {errors.region && (
                <span className={styles.fieldError}>{errors.region.message}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="settlement" className={styles.label}>
                Населенный пункт *
              </label>
              <input
                type="text"
                id="settlement"
                className={styles.input}
                disabled={isSubmitting}
                {...register("settlement", {
                  required: "Требуется указать населенный пункт"
                })}
              />
              {errors.settlement && (
                <span className={styles.fieldError}>{errors.settlement.message}</span>
              )}
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="domain" className={styles.label}>
                Домен *
              </label>
              <input
                type="text"
                id="domain"
                placeholder="example.com"
                className={styles.input}
                disabled={isSubmitting}
                {...register("domain", {
                  required: "Требуется указать домен",
                  pattern: {
                    value: /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/,
                    message: "Введите действительное доменное имя"
                  }
                })}
              />
              {errors.domain && (
                <span className={styles.fieldError}>{errors.domain.message}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="ogrn" className={styles.label}>
                OGRN
              </label>
              <input
                type="text"
                id="ogrn"
                className={styles.input}
                disabled={isSubmitting}
                {...register("ogrn")}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
