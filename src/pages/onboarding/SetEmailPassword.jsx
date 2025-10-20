import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { userService } from '../../services/userService';
import { Pages } from '../../constants/routes';
import styles from './SetEmailPassword.module.css';

function SetEmailPassword() {
  const navigate = useNavigate();
  const [formError, setFormError] = useState('');
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      email: '',
      oldPassword: '',
    },
  });

  const mutation = useMutation({
    mutationFn: ({ email, oldPassword }) => 
      userService.startSetEmailAndPassword(email, oldPassword),
    onSuccess: () => {
      navigate(Pages.VerifyCode);
    },
    onError: (error) => {
      if(error?.message === 'email already confirmed'){
        navigate(Pages.OnboardingSuccess);
        return;
      }
      setFormError(error.message || 'Failed to submit. Please try again.');
    },
  });

  const onSubmit = (data) => {
    setFormError('');
    mutation.mutate(data);
  };

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <h1>Set Your Email & Password</h1>
        <p className={styles.subtitle}>
          Please set your email address and confirm your current password
        </p>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              Email Address
            </label>
            <input
              id="email"
              type="email"
              className={styles.input}
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
            />
            {errors.email && (
              <span className={styles.error}>{errors.email.message}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="oldPassword" className={styles.label}>
              Current Password
            </label>
            <input
              id="oldPassword"
              type="password"
              className={styles.input}
              {...register('oldPassword', {
                required: 'Current password is required',
              })}
            />
            {errors.oldPassword && (
              <span className={styles.error}>{errors.oldPassword.message}</span>
            )}
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting || mutation.isPending}
          >
            {mutation.isPending ? 'Processing...' : 'Continue'}
          </button>

          {formError && <div className={styles.formError}>{formError}</div>}
        </form>
      </div>
    </div>
  );
}

export default SetEmailPassword;