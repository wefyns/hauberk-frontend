import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";

import footerIconUrl from '../../assets/images/footer.jpg'

import { Logo } from "../../components/logo/Logo";

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
    <div className={styles.root}>
          <div className={styles.content}>
            <div className={styles.firstBlock}>
              <div>
                <div className={styles.header}>
                  <Logo />
                  <span>HAUBERK</span>
                </div>
                <div className={styles.subtitle}>
                  <span>Надежный инструмент управления цифровыми сетями на базе Hyperledger Fabric</span>
                </div>
              </div>
            </div>
    
            <div className={styles.secondBlock}>
              <div className={styles.fullWidth}>
                <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
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
                          required: "Username is required",
                        })}
                        aria-invalid={errors.login ? "true" : "false"}
                      />
                      {errors.login && <span className={styles.error}>{errors.login.message}</span>}
                    </div>

                    <div className={styles.footerLinks}>
                      <Link to={Pages.Login} className={styles.link}>
                        Вернуться к входу в систему
                      </Link>
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
          </div>
    
      <div className={styles.bottom}>
        <img src={footerIconUrl} alt="footer icon" />
      </div>
    </div>
  );
}

export default ResetPassword;
