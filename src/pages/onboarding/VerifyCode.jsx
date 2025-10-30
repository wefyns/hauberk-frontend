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
      setFormError(error.message || 'Не удалось проверить. Пожалуйста, попробуйте снова.');
    },
  });

  const onSubmit = (data) => {
    setFormError('');
    
    // Check if passwords match
    if (data.newPassword !== data.confirmPassword) {
      setFormError('Пароли не совпадают');
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
        <h1>Подтвердите свой адрес электронной почты</h1>
        <p className={styles.subtitle}>
          Мы отправили код подтверждения на ваш электронный адрес. 
          Пожалуйста, введите код ниже вместе с вашим новым паролем.
        </p>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.formGroup}>
            <label htmlFor="resetCode" className={styles.label}>
              Код подтверждения
            </label>
            <input
              id="resetCode"
              type="text"
              className={styles.input}
              {...register('resetCode', {
                required: 'Требуется код подтверждения',
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
              {...register('newPassword', {
                required: 'Требуется новый пароль',
                minLength: {
                  value: 8,
                  message: 'Пароль должен содержать не менее 8 символов',
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
              {...register('confirmPassword', {
                required: 'Пожалуйста, подтвердите свой пароль',
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
            {mutation.isPending ? 'Подтверждение...' : 'Завершить настройку'}
          </button>

          {formError && <div className={styles.formError}>{formError}</div>}
        </form>
      </div>
    </div>
  );
}

export default VerifyCode;