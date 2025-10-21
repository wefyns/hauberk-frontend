import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "react-router-dom";

import loginIconUrl from '../../assets/images/login.svg'
import footerIconUrl from '../../assets/images/footer.jpg'

import { Logo } from "../../components/logo/Logo";

import { authService } from "../../services/authService";
import { useAuthContext } from "../../contexts/useAuth";
import { Pages } from "../../constants/routes";

import styles from "./Login.module.css";

function Login() {
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const { loginToApp } = useAuthContext();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const mutation = useMutation({
    mutationFn: ({ username, password }) =>
      authService.login(username, password),
    onSuccess: (response) => {
      loginToApp(response);
      setFormError("");
      setSuccessMessage("Login successful!");
    },
    onError: (error) => {
      setFormError(error.message || "Login failed. Please try again.");
    },
  });

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
    }
  }, [location.state]);

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
            <div className={styles.subtitle}>
              <span>Надежный инструмент управления цифровыми сетями на базе Hyperledger Fabric</span>
            </div>
          </div>

          <div className={styles.entranceContainer}>
            <h1 className={styles.entrance}>
              <span>ВХОД</span>
              <img src={loginIconUrl} alt="Login icon" />
            </h1>
          </div>
        </div>

        <div className={styles.secondBlock}>
          <div className={styles.fullWidth}>
            <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className={styles.formContainer}>
                <div className={styles.formGroup}>
                  <label htmlFor="username" className={styles.label}>
                    Имя пользователя
                  </label>
                  <input
                    id="username"
                    type="text"
                    className={`${styles.input} ${errors.username ? styles.inputError : ""}`}
                    {...register("username", {
                      required: "Username is required",
                      minLength: {
                        value: 3,
                        message: "Username must be at least 3 characters",
                      },
                    })}
                    aria-invalid={errors.username ? "true" : "false"}
                    placeholder="Введите имя пользователя"
                  />
                  {errors.username && (
                    <span className={styles.error}>{errors.username.message}</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="password" className={styles.label}>
                    Пароль
                  </label>
                  <input
                    id="password"
                    type="password"
                    className={`${styles.input} ${errors.password ? styles.inputError : ""}`}
                    {...register("password", {
                      required: "Password is required",
                    })}
                    aria-invalid={errors.password ? "true" : "false"}
                    placeholder="Введите пароль"
                  />
                  {errors.password && (
                    <span className={styles.error}>{errors.password.message}</span>
                  )}
                </div>

                <div className={styles.footerLinks}>
                  <Link to={Pages.ResetPassword} className={styles.link}>
                    Забыли Пароль?
                  </Link>
                </div>
              </div>

                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={isSubmitting || mutation.isPending}
                >
                  {mutation.isPending ? "Вход в систему..." : "Войти"}
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

export default Login;
