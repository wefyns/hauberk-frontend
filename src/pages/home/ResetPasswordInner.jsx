import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";

import { authService } from "../../services/authService";
import { Pages } from "../../constants/routes";
import styles from "../Home.module.css";

function ResetPasswordInner() {
  const navigate = useNavigate();

  const [formError, setFormError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm({
    defaultValues: {
      login: "",
    },
  });

  const mutation = useMutation({
    mutationFn: ({ login }) => authService.resetPasswordStart(login),
    onSuccess: () => {
      setIsSuccess(true);
      setFormError("");
      // Navigate to confirmation page with login
      setTimeout(() => {
        navigate("confirm", {
          state: { login: getValues("login") },
        });
      }, 2000);
    },
    onError: (error) => {
      setFormError(error.message || "Failed to send reset code. Please try again.");
    },
  });

  const onSubmit = (data) => {
    setFormError("");
    mutation.mutate(data);
  };

  if (isSuccess) {
    return (
      <div className={styles.formPanelReset}>
        <div className={styles.cardReset} role="region" aria-live="polite">
          <div className={styles.cardHeader}>
            <h1>Проверьте свою электронную почту</h1>
            <p className={styles.lead}>Мы отправили код сброса на ваш электронный адрес.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.rootInner}>
      <div className={styles.fullWidth}>
        <div className={styles.formHeader}>
          {formError && (
            <div className={styles.errorMessage}>
              {formError}
            </div>
          )}
        </div>
      
        <form 
          className={
            formError
              ? styles.formB
              : styles.form
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
                  className={`${styles.input} ${errors.login ? styles.inputError : ""}`}
                  {...register("login", {
                    required: "Требуется имя пользователя",
                  })}
                  aria-invalid={errors.login ? "true" : "false"}
                />
                  {errors.login && <span className={styles.error}>{errors.login.message}</span>}
                </div>
              </div>

              <button
                type="submit"
                className={styles.submitButton}
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Отправка..." : "Отправить код сброса"}
              </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPasswordInner;
