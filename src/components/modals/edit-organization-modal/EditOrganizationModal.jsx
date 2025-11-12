import React, { useEffect } from "react";

import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";

import { organizationService } from "../../../services";

import { Select } from "../../select/Select";
import { Dialog } from "../../dialog/Dialog";

import { COUNTRIES } from "../../../constants/data";

import styles from "./EditOrganizationModal.module.css";

export default function EditOrganizationModal({ visible, onClose, organization, onSuccess }) {
  const {
    register,
    handleSubmit,
    reset,
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
      domain_name: "",
      settlement: "",
      ogrn: "",
    },
  });

  const watchedCountry = watch("country", "");
  const watchedCountryCode = watch("country_code", "");

  useEffect(() => {
    if (visible && organization) {
      reset({
        name: organization.name ?? "",
        name_lat: organization.name_lat ?? "",
        country: organization.country ?? "",
        country_code: organization.country_code ?? "",
        region: organization.region ?? "",
        domain_name: organization.domain_name ?? "",
        settlement: organization.settlement ?? "",
        ogrn: organization.ogrn ?? "",
      });
    } else if (!visible) {
      reset({
        name: "",
        name_lat: "",
        country: "",
        country_code: "",
        region: "",
        domain_name: "",
        settlement: "",
        ogrn: "",
      });
    }
  }, [organization, visible, reset]);

  const updateMutation = useMutation({
    mutationFn: ({ orgId, payload }) => {
      return organizationService.updateOrganization(orgId, payload);
    },
    onSuccess: () => {
      onSuccess?.();
      onClose?.("custom");
      reset();
    },
    onError: (err) => {
      console.error("update organization failed:", err);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ orgId }) => {
      return organizationService.deleteOrganization(orgId);
    },
    onSuccess: () => {
      onSuccess?.();
      onClose?.("custom");
      reset();
    },
    onError: (err) => {
      console.error("delete organization failed:", err);
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

  const onSubmit = (data) => {
    if (!organization?.id) return;

    const payload = {
      name: data.name,
      name_lat: data.name_lat,
      country: data.country,
      country_code: data.country_code,
      region: data.region,
      domain_name: data.domain_name,
      settlement: data.settlement,
      ogrn: data.ogrn,
    };

    updateMutation.mutate({ orgId: organization.id, payload });
  };

  const handleDelete = () => {
    if (!organization?.id) return;

    deleteMutation.mutate({ orgId: organization.id });
  };

  const title = `Редактировать организацию — ${organization?.name || organization?.id || ""}`;
  const submitLabel = updateMutation.isPending ? "Обновление..." : "Обновить организацию";

  return (
    <Dialog
      visible={visible}
      onClose={(reason) => onClose?.(reason)}
      title={title}
      width="large"
      height="auto"
      position="center"
      backdropVariant="blur"
      footerButtons={null}
    >
      <div className={styles.container}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.label}>Название *</label>
              <input
                id="name"
                type="text"
                className={styles.input}
                {...register("name", { required: "Требуется название" })}
                placeholder="Название организации"
              />
              {errors.name && <span className={styles.error}>{errors.name.message}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="name_lat" className={styles.label}>Название (латиница) *</label>
              <input
                id="name_lat"
                type="text"
                className={styles.input}
                {...register("name_lat", { required: "Требуется латинское название" })}
                placeholder="Organization Name"
              />
              {errors.name_lat && <span className={styles.error}>{errors.name_lat.message}</span>}
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
                errors={errors}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="country_code" className={styles.label}>Код страны *</label>
              <input
                type="text"
                id="country_code"
                placeholder="RU, US, GB..."
                className={styles.input}
                disabled
                {...register("country_code", {
                  required: "Код страны обязателен",
                })}
                value={watchedCountryCode || ""}
              />
              {errors.country_code && <span className={styles.error}>{errors.country_code.message}</span>}
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="region" className={styles.label}>Регион *</label>
              <input
                id="region"
                type="text"
                className={styles.input}
                {...register("region", { required: "Требуется регион" })}
                placeholder="Московская область"
              />
              {errors.region && <span className={styles.error}>{errors.region.message}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="settlement" className={styles.label}>Населенный пункт *</label>
              <input
                id="settlement"
                type="text"
                className={styles.input}
                {...register("settlement", { required: "Требуется населенный пункт" })}
                placeholder="Москва"
              />
              {errors.settlement && <span className={styles.error}>{errors.settlement.message}</span>}
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="domain_name" className={styles.label}>Доменное имя *</label>
              <input
                id="domain_name"
                type="text"
                className={styles.input}
                {...register("domain_name", { required: "Требуется доменное имя" })}
                placeholder="example.com"
              />
              {errors.domain_name && <span className={styles.error}>{errors.domain_name.message}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="ogrn" className={styles.label}>ОГРН *</label>
              <input
                id="ogrn"
                type="text"
                className={styles.input}
                {...register("ogrn", { required: "Требуется ОГРН" })}
                placeholder="1234567890123"
              />
              {errors.ogrn && <span className={styles.error}>{errors.ogrn.message}</span>}
            </div>
          </div>

          {updateMutation.isError && (
            <div className={styles.serverError}>
              {updateMutation.error?.message || "Ошибка сервера при обновлении организации"}
            </div>
          )}

          {deleteMutation.isError && (
            <div className={styles.serverError}>
              {deleteMutation.error?.message || "Ошибка сервера при удалении организации"}
            </div>
          )}

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.danger}
              onClick={handleDelete}
              disabled={updateMutation.isPending || deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Удаление..." : "Удалить организацию"}
            </button>

            <div style={{ flex: 1 }} />

            <button
              type="button"
              className={styles.ghost}
              onClick={() => {
                reset();
                onClose?.("custom");
              }}
              disabled={updateMutation.isPending || deleteMutation.isPending}
            >
              Отменить
            </button>

            <button
              type="submit"
              className={styles.primary}
              disabled={updateMutation.isPending || deleteMutation.isPending}
            >
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </Dialog>
  );
}
