import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { Logo } from "../../components/logo/Logo";
import footerIconUrl from '../../assets/images/footer.jpg'

import { authService } from "../../services/authService";
import { Pages } from "../../constants/routes";

import styles from "./Login.module.css";

function ResetPasswordConfirm() {
  const [formError, setFormError] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const loginFromState = location.state?.login || "";

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
      navigate(Pages.Login, {
        state: { message: "Password reset successfully. Please log in with your new password." },
      });
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
    <div className={styles.root}>
      <div className={styles.content}>
        <div className={styles.firstBlock}>
          <div>
            <div className={styles.header}>
              <Logo />
              <span>HAUBERK</span>
            </div>
          </div>
          <div className={styles.subtitle}>
            <span>Надежный инструмент управления цифровыми сетями на базе Hyperledger Fabric</span>
          </div>
        </div>

        <div className={styles.secondBlockB}>
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
                    disabled
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

                  <div style={{ textAlign: "center", marginTop: "0.5rem" }}>
                    <Link to={Pages.Login}>Вернуться к входу в систему</Link>
                  </div>
                </div>
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

export default ResetPasswordConfirm;
