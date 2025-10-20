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
      <div className={styles.loginContainer}>
        <div className={styles.loginForm}>
          <div className={styles.formHeader}>
            <h1>Check Your Email</h1>
            <p>We've sent a reset code to your email address.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginForm}>
        <div className={styles.formHeader}>
          <h1>Reset Password</h1>
          <p>Enter your username to receive a reset code</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.formGroup}>
            <label htmlFor="login" className={styles.label}>
              Username
            </label>
            <input
              id="login"
              type="text"
              className={styles.input}
              {...register("login", {
                required: "Username is required",
              })}
            />
            {errors.login && (
              <span className={styles.error}>{errors.login.message}</span>
            )}
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Sending..." : "Send Reset Code"}
          </button>

          {formError && <div className={styles.formError}>{formError}</div>}
        </form>

        <div style={{ textAlign: "center", marginTop: "1rem" }}>
          <Link to={Pages.Login}>Back to Login</Link>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
