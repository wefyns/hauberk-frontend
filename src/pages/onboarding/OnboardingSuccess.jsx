import { useNavigate } from 'react-router-dom';
import { Pages } from '../../constants/routes';
import footerIconUrl from '../../assets/images/footer.jpg';
import { Logo } from '../../components/logo/Logo';
import styles from './OnboardingSuccess.module.css';

function OnboardingSuccess() {
  const navigate = useNavigate();
  
  const handleGoHome = () => {
    navigate(Pages.CreateOrganization);
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
            <span>Добро пожаловать!</span>
          </h1>

          <p className={styles.subtitle}>
            Ваша учетная запись успешно подтверждена. Теперь создайте организацию и начните работу с системой.
          </p>
        </div>

        <div className={styles.rightBlock}>
          <div className={styles.card}>
            <div className={styles.successIcon}>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="80" 
                height="80" 
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
            
            <h2 className={styles.successTitle}>Настройка завершена!</h2>
            
            <p className={styles.message}>
              Ваша учетная запись готова к использованию. 
              Создайте организацию для начала работы с платформой.
            </p>
            
            <div className={styles.cardFooter}>
              <button 
                className={styles.homeButton}
                onClick={handleGoHome}
              >
                Создать организацию
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <img src={footerIconUrl} alt="footer" />
      </div>
    </div>
  );
}

export default OnboardingSuccess;