import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import footerIconUrl from '../../assets/images/footer.jpg'

import { Logo } from "../../components/logo/Logo";
import { COUNTRIES } from '../../constants/data'
import { Select } from "../../components/select/Select";

import { organizationService } from "../../services/organizationService";
import { useAuthContext } from "../../contexts/useAuth";
import { Pages } from "../../constants/routes";

import styles from "./CreateOrganization.module.css";

function CreateOrganization() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { logoutFromApp } = useAuthContext();

  const [error, setError] = useState(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
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
    onSuccess: async () => {
      setError(null);

      await queryClient.invalidateQueries(["organizations"]);
      
      setTimeout(() => {
        navigate(Pages.Organizations, { replace: true });
        window.location.reload();
      }, 400);
    },
    onError: (err) => {
      setError(err.message || "Ошибка при создании организации");
    },
  });

  const onSubmit = async (data) => {
    setError(null);
    createOrganizationMutation.mutateAsync(data);
  };

  const handleCancel = () => {
    navigate(Pages.Organizations);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.logo}>
          <Logo />
          <span>HAUBERK</span>
          </div>
        <button onClick={logoutFromApp} className={styles.logoutButton}>
          Выход
        </button>
      </div>

      <div className={styles.content}>
        <div className={styles.formContainer}>
          <h1 className={styles.title}>Создать новую организацию</h1>
          <p className={styles.subtitle}>Заполните данные, чтобы создать свою организацию</p>

          {error && (
            <div className={styles.error}>
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="name" className={styles.label}>
                  Название организации *
                </label>
                <input
                  type="text"
                  id="name"
                  className={styles.input}
                  {...register("name", {
                    required: "Требуется указать название организации"
                  })}
                />
                {errors.name && <span className={styles.error}>{errors.name.message}</span>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="name_lat" className={styles.label}>
                  Латинизированное название *
                </label>
                <input
                  type="text"
                  id="name_lat"
                  className={styles.input}
                  {...register("name_lat", {
                    required: "Требуется латинизированное название"
                  })}
                />
                {errors.name_lat && <span className={styles.error}>{errors.name_lat.message}</span>}
              </div>
            </div>

            <div className={styles.formRow}>
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

              <div className={styles.formGroup}>
                <label htmlFor="country_code" className={styles.label}>
                  Код страны *
                </label>
                <input
                  type="text"
                  id="country_code"
                  placeholder="e.g., US, RU, GB"
                  className={styles.input}
                  {...register("country_code", {
                    required: "Country code is required",
                    pattern: {
                      value: /^[A-Z]{2}$/,
                      message: "Введите действительный 2-буквенный код страны (например, US, RU)."
                    }
                  })}
                  value={watchedCountryCode || ""}
                  disabled
                />
                {errors.country_code && <span className={styles.error}>{errors.country_code.message}</span>}
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
                  {...register("region", {
                    required: "Требуется регион"
                  })}
                />
                {errors.region && <span className={styles.error}>{errors.region.message}</span>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="settlement" className={styles.label}>
                  Поселок *
                </label>
                <input
                  type="text"
                  id="settlement"
                  className={styles.input}
                  {...register("settlement", {
                    required: "Требуется расчет"
                  })}
                />
                {errors.settlement && <span className={styles.error}>{errors.settlement.message}</span>}
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
                  placeholder="например, example.com"
                  className={styles.input}
                  {...register("domain", {
                    required: "Требуется домен",
                    pattern: {
                      value: /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/,
                      message: "Введите действительное доменное имя (например, example.com)"
                    }
                  })}
                />
                {errors.domain && <span className={styles.error}>{errors.domain.message}</span>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="ogrn" className={styles.label}>
                  OGRN
                </label>
                <input
                  type="text"
                  id="ogrn"
                  className={styles.input}
                  {...register("ogrn")}
                />
              </div>
            </div>

            <div className={styles.buttonGroup}>
              <button
                type="button"
                onClick={handleCancel}
                className={styles.cancelButton}
                disabled={isSubmitting}
              >
                Отменить
              </button>
              <button
                type="submit"
                className={styles.submitButton}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Создание..." : "Создать организацию"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className={styles.bottom}>
        <img src={footerIconUrl} alt="footer icon" />
      </div>
    </div>
  );
}

export default CreateOrganization;