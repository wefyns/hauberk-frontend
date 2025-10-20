import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
    <div className={styles.loginContainer}>
      <div className={styles.loginForm}>
        <div className={styles.formHeader}>
          <h1>Reset Password</h1>
          <p>Enter the reset code and your new password</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.formGroup}>
            <label htmlFor="login" className={styles.label}>
              Username
            </label>
            <input
              id="login"
              type="text"
              disabled
              className={styles.input}
              {...register("login", {
                required: "Username is required",
              })}
            />
            {errors.login && (
              <span className={styles.error}>{errors.login.message}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="resetCode" className={styles.label}>
              Reset Code
            </label>
            <input
              id="resetCode"
              type="text"
              className={styles.input}
              placeholder="Enter the code from your email"
              {...register("resetCode", {
                required: "Reset code is required",
              })}
            />
            {errors.resetCode && (
              <span className={styles.error}>{errors.resetCode.message}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="newPassword" className={styles.label}>
              New Password
            </label>
            <input
              id="newPassword"
              type="password"
              className={styles.input}
              {...register("newPassword", {
                required: "New password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
            />
            {errors.newPassword && (
              <span className={styles.error}>{errors.newPassword.message}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              className={styles.input}
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (value) =>
                  value === watchNewPassword || "Passwords do not match",
              })}
            />
            {errors.confirmPassword && (
              <span className={styles.error}>{errors.confirmPassword.message}</span>
            )}
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Resetting..." : "Reset Password"}
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

export default ResetPasswordConfirm;
