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
    <div className={styles.loginContainer}>
      <div className={styles.loginForm}>
        <div className={styles.formHeader}>
          <h1>Welcome Back</h1>
          <p>Sign in to your account</p>
        </div>

        {successMessage && (
          <div className={styles.successMessage}>{successMessage}</div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.formGroup}>
            <label htmlFor="username" className={styles.label}>
              Username
            </label>
            <input
              id="username"
              type="text"
              className={styles.input}
              {...register("username", {
                required: "Username is required",
                minLength: {
                  value: 3,
                  message: "Username must be at least 3 characters",
                },
              })}
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
              className={styles.input}
              {...register("password", {
                required: "Password is required",
              })}
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

          {formError && <div className={styles.formError}>{formError}</div>}
        </form>

        <div style={{ textAlign: "center", marginTop: "1rem" }}>
          <Link to={Pages.ResetPassword}>Forgot Password?</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
