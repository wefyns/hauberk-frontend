import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "react-router-dom";
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
    <div className={styles.wrapper}>
      <aside className={styles.brandPanel} aria-hidden="true">
        <div className={styles.brandInner}>
          <div className={styles.brandBig}>HAUBERK</div>
        </div>
      </aside>

      <main className={styles.formPanel}>
        <div className={styles.card} role="region" aria-labelledby="login-heading">
          <header className={styles.cardHeader}>
            <h1 id="login-heading">Welcome Back</h1>
            <p className={styles.lead}>Sign in to your account</p>
          </header>

          <div className={styles.messages} aria-live="polite">
            {successMessage && (
              <div className={styles.successMessage}>{successMessage}</div>
            )}
            {formError && <div className={styles.formError}>{formError}</div>}
          </div>

          <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className={styles.formGroup}>
              <label htmlFor="username" className={styles.label}>
                Username
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
              />
              {errors.username && (
                <span className={styles.error}>{errors.username.message}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.label}>
                Password
              </label>
              <input
                id="password"
                type="password"
                className={`${styles.input} ${errors.password ? styles.inputError : ""}`}
                {...register("password", {
                  required: "Password is required",
                })}
                aria-invalid={errors.password ? "true" : "false"}
              />
              {errors.password && (
                <span className={styles.error}>{errors.password.message}</span>
              )}
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={isSubmitting || mutation.isPending}
            >
              {mutation.isPending ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className={styles.footerLinks}>
            <Link to={Pages.ResetPassword} className={styles.link}>
              Forgot Password?
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Login;
