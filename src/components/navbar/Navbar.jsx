import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../contexts/useAuth";
import { useOrganization } from "../../contexts/useOrganization";
import { Pages } from "../../constants/routes";

import styles from './Navbar.module.css'

export default function Navbar() {
  const navigate = useNavigate();
  const { logoutFromApp } = useAuthContext();
  const { selectedOrganization, clearSelectedOrganization } = useOrganization();

  const handleChangeOrganization = () => {
    clearSelectedOrganization();
    navigate(Pages.Organizations);
  };

  return (
    <div className={styles.sidebarFooter}>
      <div className={styles.organizationInfo}>
          <div className={styles.orgName}>{selectedOrganization.name}</div>
        </div>

      <div>
        <button
          onClick={handleChangeOrganization}
          className={styles.changeOrgButton}
        >
          <span className={styles.navText}>
            Изменить организацию
          </span>
        </button>
        <button onClick={logoutFromApp} className={styles.logoutButton}>
          <span className={styles.navText}>Выход</span>
        </button>
      </div>
    </div>
  );
};
