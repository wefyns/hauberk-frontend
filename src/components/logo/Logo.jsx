import logo from '../../assets/images/logo-dashboard.svg';
import logoAuth from '../../assets/images/logo-login.svg';
import styles from './Logo.module.css';

export const Logo = ({ variant }) => {
  if (variant === 'dashboard') {
    return (
      <div className={styles.container}>
        <img src={logo} alt="Hauberk" />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <img src={logoAuth} alt="Hauberk" />
    </div>
  );
};
