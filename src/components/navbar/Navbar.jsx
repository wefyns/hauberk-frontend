import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../contexts/useAuth";
import { useOrganization } from "../../contexts/useOrganization";
import { Pages } from "../../constants/routes";

import userIconUrl from '../../assets/images/user.svg'
import questionIconUrl from '../../assets/images/question.svg'
import notificationIconUrl from '../../assets/images/notification.svg'

import { ActionMenu } from "../action-menu/ActionMenu";

import styles from './Navbar.module.css'

export default function Navbar({ 
  currentUser,
  onResetPasswordStart,
  resetLoading = false,
  resetMessage = null,    
}) {
  const navigate = useNavigate();
  const { logoutFromApp } = useAuthContext();
  const { selectedOrganization, clearSelectedOrganization } = useOrganization();

  const handleChangeOrganization = () => {
    clearSelectedOrganization();
    navigate(Pages.Organizations);
  };

  const handleResetClick = async () => {
    if (typeof onResetPasswordStart === "function") {
      onResetPasswordStart();
    } else {
      console.warn("onResetPasswordStart not provided");
    }
  };

  return (
    <div className={styles.sidebarFooter}>
      <div className={styles.organizationInfo}>
        <div className={styles.orgButtonContent}>
          <div className={styles.orgName}>{selectedOrganization?.name ?? "—"}</div>
        </div>
        
        <button
          type="button"
          className={styles.imgButton}
          onClick={() => {}}
        >
          <img src={questionIconUrl} alt="question icon" />
        </button>
        <button
          type="button"
          className={styles.imgButton}
          onClick={() => {}}
        >
          <img src={notificationIconUrl} alt="notification icon" />
        </button>

        <ActionMenu>
          <ActionMenu.Button>
            <img src={userIconUrl} alt="user icon" />
          </ActionMenu.Button>

          <ActionMenu.Overlay placement="bottom-start" closeOnItemClick>
            <div className={styles.containerInner}>
              <div className={styles.header}>
                <div className={styles.email}>{currentUser?.email ?? "—"}</div>
                <div className={styles.role}>Роль: {currentUser?.role ?? "—"}</div>
              </div>

              <button
                type="button"
                role="menuitem"
                className={styles.changeOrgButton}
                onClick={handleChangeOrganization}
              >
                Изменить организацию
              </button>

              <button
                type="button"
                role="menuitem"
                className={styles.resetPasswordButton}
                onClick={handleResetClick}
                disabled={resetLoading}
                title="Отправить код для сброса пароля на email"
              >
                {resetLoading ? "Отправка..." : "Сменить пароль"}
              </button>

              <button
                type="button"
                role="menuitem"
                className={styles.logoutButton}
                onClick={logoutFromApp}
              >
                Выход
              </button>

              {resetMessage && (
                <div style={{ marginTop: 8, padding: 8, fontSize: 13, color: "#222", background: "rgba(0,0,0,0.03)", borderRadius: 6 }}>
                  {resetMessage}
                </div>
              )}
            </div>
          </ActionMenu.Overlay>
        </ActionMenu>
      </div>
    </div>
  );
};
