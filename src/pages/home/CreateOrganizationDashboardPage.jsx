import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { COUNTRIES } from "../../constants/data";
import { Select } from "../../components/select/Select";
import { organizationService } from "../../services/organizationService";
import { useOrganization } from "../../contexts/useOrganization";
import styles from "./CreateOrganizationDashboardPage.module.css";

function CreateOrganizationDashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { fetchOrganizations } = useOrganization();
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

  const createOrganizationMutation = useMutation({
    mutationFn: (data) => organizationService.createOrganization(data),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ["organizations"] });
      
      await fetchOrganizations();
      
      const orgId = result?.id || result?.organization?.id;
      
      if (orgId) {
        navigate(`/home/${orgId}`, { replace: true });
      } else {
        const orgsData = await queryClient.fetchQuery({
          queryKey: ["organizations"],
          queryFn: () => organizationService.getOrganizations()
        });
        
        const organizations = orgsData?.organizations || orgsData || [];
        if (organizations.length > 0) {
          const firstOrg = organizations[0];
          navigate(`/home/${firstOrg.id}`, { replace: true });
        } else {
          const currentOrgId = window.location.pathname.split('/')[2];
          navigate(`/home/${currentOrgId}/organizations`, { replace: true });
        }
      }
    },
    onError: (err) => {
      setError(err.message || "Ошибка при создании организации");
    },
  });

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

  const onSubmit = async (data) => {
    try {
      setError(null);
      await createOrganizationMutation.mutateAsync(data);
    } catch {
      // ignore
    }
  };

  const handleCancel = () => {
    const currentOrgId = window.location.pathname.split('/')[2];
    navigate(`/home/${currentOrgId}/organizations`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Создание новой организации</h1>
        <p className={styles.subtitle}>
          Заполните информацию для создания новой организации
        </p>
      </div>

      {error && (
        <div className={styles.errorContainer}>
          <div className={styles.errorMessage}>
            {error}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>
              Название организации *
            </label>
            <input
              type="text"
              id="name"
              className={styles.input}
              disabled={createOrganizationMutation.isPending}
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
              disabled={createOrganizationMutation.isPending}
              {...register("name_lat", {
                required: "Требуется латинизированное название"
              })}
            />
            {errors.name_lat && (
              <span className={styles.fieldError}>{errors.name_lat.message}</span>
            )}
          </div>

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
              disabled={createOrganizationMutation.isPending}
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

          <div className={styles.formGroup}>
            <label htmlFor="region" className={styles.label}>
              Регион *
            </label>
            <input
              type="text"
              id="region"
              className={styles.input}
              disabled={createOrganizationMutation.isPending}
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
              disabled={createOrganizationMutation.isPending}
              {...register("settlement", {
                required: "Требуется указать населенный пункт"
              })}
            />
            {errors.settlement && (
              <span className={styles.fieldError}>{errors.settlement.message}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="domain" className={styles.label}>
              Домен *
            </label>
            <input
              type="text"
              id="domain"
              placeholder="example.com"
              className={styles.input}
              disabled={createOrganizationMutation.isPending}
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
              disabled={createOrganizationMutation.isPending}
              {...register("ogrn")}
            />
          </div>
        </div>

        <div className={styles.formActions}>
          <button
            type="button"
            onClick={handleCancel}
            disabled={createOrganizationMutation.isPending}
            className={styles.cancelButton}
          >
            Отмена
          </button>
          
          <button
            type="submit"
            disabled={createOrganizationMutation.isPending}
            className={styles.submitButton}
          >
            {createOrganizationMutation.isPending ? "Создание..." : "Создать организацию"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateOrganizationDashboardPage;