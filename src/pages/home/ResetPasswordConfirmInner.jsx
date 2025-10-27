import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "react-router-dom";

import { useAuthContext } from "../../contexts/useAuth";

import { authService } from "../../services/authService";
import { Pages } from "../../constants/routes";

import styles from "../Home.module.css";

function ResetPasswordConfirmInner() {
  const location = useLocation();

  const { logoutFromApp } = useAuthContext();

  const loginFromState = location.state?.login || "";

  const [formError, setFormError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      login: loginFromState,
      resetCode: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const watchNewPassword = watch("newPassword");

  const mutation = useMutation({
    mutationFn: ({ login, resetCode, newPassword }) =>
      authService.resetPasswordFinish(login, resetCode, newPassword),
    onSuccess: () => {
      setFormError("");
      setTimeout(() => {
        logoutFromApp();
      }, 2000);
    },
    onError: (error) => {
      setFormError(error.message || "Failed to reset password. Please try again.");
    },
  });

  const onSubmit = (data) => {
    setFormError("");
    mutation.mutate(data);
  };

  return (
    <div className={styles.rootInner}>
      <div className={styles.fullWidth}>
        <div className={styles.formHeader}>
          <h1>Сброс пароля</h1>
          <p>Введите код сброса и свой новый пароль</p>

          {formError && (
            <div className={styles.errorMessage}>
              {formError}
            </div>
          )}
        </div>

        <form 
          className={
            formError
              ? styles.formC
              : styles.formB
          } 
          onSubmit={handleSubmit(onSubmit)} 
          noValidate
        >
          <div className={styles.formContainer}>
            <div className={styles.formGroup}>
              <label htmlFor="login" className={styles.label}>
                Имя пользователя
              </label>
              <input
                id="login"
                type="text"
                className={styles.input}
                {...register("login", {
                  required: "Требуется имя пользователя",
                })}
              />
              {errors.login && (
                <span className={styles.error}>{errors.login.message}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="resetCode" className={styles.label}>
                Код сброса
              </label>
              <input
                id="resetCode"
                type="text"
                className={styles.input}
                placeholder="Введите код из своего электронного письма"
                {...register("resetCode", {
                  required: "Требуется код сброса",
                })}
              />
              {errors.resetCode && (
                <span className={styles.error}>{errors.resetCode.message}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="newPassword" className={styles.label}>
                Новый пароль
              </label>
              <input
                id="newPassword"
                type="password"
                className={styles.input}
                {...register("newPassword", {
                  required: "Требуется новый пароль",
                  minLength: {
                    value: 6,
                    message: "Пароль должен содержать не менее 6 символов",
                  },
                })}
              />
              {errors.newPassword && (
                <span className={styles.error}>{errors.newPassword.message}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword" className={styles.label}>
                Подтвердите пароль
              </label>
              <input
                id="confirmPassword"
                type="password"
                className={styles.input}
                {...register("confirmPassword", {
                  required: "Пожалуйста, подтвердите свой пароль",
                  validate: (value) =>
                  value === watchNewPassword || "Пароли не совпадают",
                })}
              />
              {errors.confirmPassword && (
                <span className={styles.error}>{errors.confirmPassword.message}</span>
              )}
            </div>
          </div>

          <div className={styles.bottomBtn}>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Сброс настроек..." : "Сброс пароля"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ResetPasswordConfirmInner;
