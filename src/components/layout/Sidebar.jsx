import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../contexts/useAuth";
import { useOrganization } from "../../contexts/useOrganization";
import { Pages } from "../../constants/routes";
import styles from "../../pages/Home.module.css";

function Sidebar({ sidebarCollapsed, toggleSidebar, activeSection, orgId }) {
  const navigate = useNavigate();
  const { logoutFromApp } = useAuthContext();
  const { selectedOrganization, clearSelectedOrganization } = useOrganization();

  const handleSectionClick = (section) => {
    navigate(`/home/${orgId}/${section}`);
  };

  const handleChangeOrganization = () => {
    clearSelectedOrganization();
    navigate(Pages.Organizations);
  };


  return (
    <div
      className={`${styles.sidebar} ${
        sidebarCollapsed ? styles.collapsed : ""
      }`}
    >
      <div className={styles.sidebarHeader}>
        <div
          className={styles.logo}
          title={selectedOrganization?.name || "Hauberk"}
          aria-hidden={false}
        >
          <span className={styles.logoFull}>Hauberk</span>

          <button
            onClick={toggleSidebar}
            className={styles.logoToggleButton}
            aria-label="Expand sidebar"
            title="Expand sidebar"
          >
            →
          </button>
        </div>

        <button
          onClick={toggleSidebar}
          className={styles.toggleButton}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={sidebarCollapsed ? "Expand" : "Collapse"}
        >
          {sidebarCollapsed ? "→" : "←"}
        </button>
      </div>

      <nav className={styles.sidebarNav}>
        <button
          className={`${styles.navItem} ${
            activeSection === "agents" ? styles.active : ""
          }`}
          onClick={() => handleSectionClick("agents")}
        >
          <span className={styles.navIcon}>🤖</span>
          {!sidebarCollapsed && <span className={styles.navText}>Agents</span>}
        </button>

        <button
          className={`${styles.navItem} ${
            activeSection === "secrets" ? styles.active : ""
          }`}
          onClick={() => handleSectionClick("secrets")}
        >
          <span className={styles.navIcon}>🔐</span>
          {!sidebarCollapsed && <span className={styles.navText}>Secrets</span>}
        </button>
      </nav>

      <div className={styles.sidebarFooter}>
        <div className={styles.organizationInfo}>
          {!sidebarCollapsed && selectedOrganization && (
            <>
              <div className={styles.orgName}>{selectedOrganization.name}</div>
              <button
                onClick={handleChangeOrganization}
                className={styles.changeOrgButton}
              >
                Change Organization
              </button>
            </>
          )}
        </div>

        <button onClick={logoutFromApp} className={styles.logoutButton}>
          <span className={styles.navIcon}>🚪</span>
          {!sidebarCollapsed && <span className={styles.navText}>Logout</span>}
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
