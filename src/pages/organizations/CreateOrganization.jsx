import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import footerIconUrl from '../../assets/images/footer.jpg'

import { Logo } from "../../components/logo/Logo";
import { Wizard } from "../../components/wizard/Wizard";
import { useAuthContext } from "../../contexts/useAuth";
import { useOrganization } from "../../contexts/useOrganization";

import styles from "./CreateOrganization.module.css";

function CreateOrganization() {
  const navigate = useNavigate();

  const { logoutFromApp, currentUser } = useAuthContext();
  const { organizations, loading, fetchOrganizations } = useOrganization();

  const [showWizard, setShowWizard] = useState(false);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  useEffect(() => {
    if (!currentUser || loading) return;
    
    if (organizations.length > 0) {
      const firstOrg = organizations[0];
      navigate(`/home/${firstOrg.id}`, { replace: true });
      return;
    }
    
    setShowWizard(true);
  }, [currentUser, organizations, loading, navigate]);

  const handleWizardFinish = async () => {
    try {
      await fetchOrganizations();
      
      setTimeout(() => {
        fetchOrganizations().then(() => {
          window.location.href = '/home';
        });
      }, 500);
    } catch (error) {
      console.error('Error finishing wizard:', error);
      window.location.reload();
    }
  };

  const handleWizardCancel = () => {
    logoutFromApp();
  };

  if (!showWizard) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.logo}>
          <Logo />
          <span>HAUBERK</span>
        </div>
        <button onClick={logoutFromApp} className={styles.logoutButton}>
          Выход
        </button>
      </div>

      <div className={styles.content}>
        <div className={styles.formContainer}>
          <h1 className={styles.title}>Первичная настройка</h1>
          <p className={styles.subtitle}>
            Пройдите несколько шагов для настройки вашей первой организации
          </p>

          <Wizard
            storageKey="first_time_setup"
            onFinish={handleWizardFinish}
            onCancel={handleWizardCancel}
            forceShow={true}
          />
        </div>
      </div>

      <div className={styles.bottom}>
        <img src={footerIconUrl} alt="footer icon" />
      </div>
    </div>
  );
}

export default CreateOrganization;