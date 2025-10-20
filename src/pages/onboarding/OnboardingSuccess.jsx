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
        <h1>Setup Complete!</h1>
        <p className={styles.message}>
          Your account has been successfully set up. You can now start using the application.
        </p>
        <button 
          className={styles.homeButton}
          onClick={handleGoHome}
        >
          Go to Home
        </button>
      </div>
    </div>
  );
}

export default OnboardingSuccess;