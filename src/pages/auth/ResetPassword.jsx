import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";
import { Pages } from "../../constants/routes";
import styles from "./Login.module.css";

function ResetPassword() {
  const [formError, setFormError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

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
        navigate(Pages.ResetPasswordConfirm, {
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
              <h1>Check Your Email</h1>
              <p className={styles.lead}>We've sent a reset code to your email address.</p>
            </div>

          
            <div style={{ marginTop: "1rem", textAlign: "center" }}>
              <Link to={Pages.Login} className={styles.link}>
                Вернуться к входу
              </Link>
            </div>
          </div>


        </div>
    );
  }

  return (
   <div className={styles.wrapper}>
      <aside className={styles.brandPanel} aria-hidden="true">
        <div className={styles.brandInner}>
          <div className={styles.brandBig}>HAUBERK</div>
        </div>
      </aside>

      <main className={styles.formPanel}>
        <div className={styles.card} role="region" aria-labelledby="reset-heading">
          <header className={styles.cardHeader}>
            <h1 id="reset-heading">Reset Password</h1>
            <p className={styles.lead}>Enter your username to receive a reset code</p>
          </header>

          <div className={styles.messages} aria-live="polite">
            {formError && <div className={styles.formError}>{formError}</div>}
          </div>

          <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className={styles.formGroup}>
              <label htmlFor="login" className={styles.label}>
                Username
              </label>
              <input
                id="login"
                type="text"
                className={`${styles.input} ${errors.login ? styles.inputError : ""}`}
                {...register("login", {
                  required: "Username is required",
                })}
                aria-invalid={errors.login ? "true" : "false"}
              />
              {errors.login && <span className={styles.error}>{errors.login.message}</span>}
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Sending..." : "Send Reset Code"}
            </button>
          </form>

          <div className={styles.footerLinks}>
            <Link to={Pages.Login} className={styles.link}>
              Back to Login
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ResetPassword;
