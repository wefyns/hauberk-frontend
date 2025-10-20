import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { userService } from '../../services/userService';
import { Pages } from '../../constants/routes';
import styles from './VerifyCode.module.css';

function VerifyCode() {
  const navigate = useNavigate();
  const [formError, setFormError] = useState('');
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
      resetCode: '',
    },
  });

  const mutation = useMutation({
    mutationFn: ({ newPassword, resetCode }) => 
      userService.finishSetEmailAndPassword(newPassword, resetCode),
    onSuccess: () => {
      navigate(Pages.OnboardingSuccess);
    },
    onError: (error) => {
      setFormError(error.message || 'Failed to verify. Please try again.');
    },
  });

  const onSubmit = (data) => {
    setFormError('');
    
    // Check if passwords match
    if (data.newPassword !== data.confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }
    
    mutation.mutate({
      newPassword: data.newPassword,
      resetCode: data.resetCode,
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <h1>Verify Your Email</h1>
        <p className={styles.subtitle}>
          We've sent a verification code to your email address. 
          Please enter the code below along with your new password.
        </p>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.formGroup}>
            <label htmlFor="resetCode" className={styles.label}>
              Verification Code
            </label>
            <input
              id="resetCode"
              type="text"
              className={styles.input}
              {...register('resetCode', {
                required: 'Verification code is required',
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
              {...register('newPassword', {
                required: 'New password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters',
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
              {...register('confirmPassword', {
                required: 'Please confirm your password',
              })}
            />
            {errors.confirmPassword && (
              <span className={styles.error}>{errors.confirmPassword.message}</span>
            )}
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting || mutation.isPending}
          >
            {mutation.isPending ? 'Verifying...' : 'Complete Setup'}
          </button>

          {formError && <div className={styles.formError}>{formError}</div>}
        </form>
      </div>
    </div>
  );
}

export default VerifyCode;