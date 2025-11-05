import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { userService } from '../../services/userService';
import { Pages } from '../../constants/routes';
import footerIconUrl from '../../assets/images/footer.jpg';
import { Logo } from '../../components/logo/Logo';
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
    <div className={styles.root}>
      <div className={styles.content}>
        <div className={styles.leftBlock}>
          <div className={styles.brand}>
            <Logo />
            <span className={styles.brandName}>HAUBERK</span>
          </div>

          <h1 className={styles.headline}>
            <span>Подтверждение</span>
          </h1>

          <p className={styles.subtitle}>
            Мы отправили код подтверждения на ваш адрес электронной почты. Введите код и установите новый пароль.
          </p>
        </div>

        <div className={styles.rightBlock}>
          <div className={styles.card}>
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

              {formError && <div className={styles.formError}>{formError}</div>}

              <div className={styles.cardFooter}>
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={isSubmitting || mutation.isPending}
                >
                  {mutation.isPending ? 'Подтверждение...' : 'Завершить настройку'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <img src={footerIconUrl} alt="footer" />
      </div>
    </div>
  );
}

export default VerifyCode;