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
      setFormError(error.message || 'Не удалось отправить заявку. Пожалуйста, попробуйте снова.');
    },
  });

  const onSubmit = (data) => {
    setFormError('');
    mutation.mutate(data);
  };

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <h1>Установите свой адрес электронной почты и пароль</h1>
        <p className={styles.subtitle}>
          Пожалуйста, укажите свой адрес электронной почты и подтвердите свой текущий пароль
        </p>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              Адрес электронной почты
            </label>
            <input
              id="email"
              type="email"
              className={styles.input}
              {...register('email', {
                required: 'Требуется электронная почта',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Неверный адрес электронной почты',
                },
              })}
            />
            {errors.email && (
              <span className={styles.error}>{errors.email.message}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="oldPassword" className={styles.label}>
              Текущий пароль
            </label>
            <input
              id="oldPassword"
              type="password"
              className={styles.input}
              {...register('oldPassword', {
                required: 'Требуется пароль',
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
            {mutation.isPending ? 'Обработка...' : 'Продолжить'}
          </button>

          {formError && <div className={styles.formError}>{formError}</div>}
        </form>
      </div>
    </div>
  );
}

export default SetEmailPassword;