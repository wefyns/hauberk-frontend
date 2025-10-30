import { useNavigate } from 'react-router-dom';
import { Pages } from '../../constants/routes';
import styles from './OnboardingSuccess.module.css';

function OnboardingSuccess() {
  const navigate = useNavigate();
  
  const handleGoHome = () => {
    navigate(Pages.Home);
  };

  return (
    <div className={styles.container}>
      <div className={styles.successCard}>
        <div className={styles.successIcon}>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="64" 
            height="64" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M8 12l2 2 6-6"></path>
          </svg>
        </div>
        <h1>Настройка завершена!</h1>
        <p className={styles.message}>
          Ваша учетная запись успешно создана. Теперь вы можете начать пользоваться приложением.
        </p>
        <button 
          className={styles.homeButton}
          onClick={handleGoHome}
        >
          Перейти на главную
        </button>
      </div>
    </div>
  );
}

export default OnboardingSuccess;