import { useNavigate } from "react-router-dom";

import { Logo } from "../logo/Logo";
import { useOrganization } from "../../contexts/useOrganization";

import styles from "../../pages/Home.module.css";

function Sidebar({ sidebarCollapsed, toggleSidebar, activeSection, orgId }) {
  const navigate = useNavigate();
  const { selectedOrganization } = useOrganization();

  const handleSectionClick = (section) => {
    navigate(`/home/${orgId}/${section}`);
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
          aria-hidden={false}
        >
          <Logo variant='dashboard' />
          <span className={styles.logoFull}>Hauberk</span>
          

          {/* <button
            onClick={toggleSidebar}
            className={styles.logoToggleButton}
            aria-label="Expand sidebar"
            title="Expand sidebar"
          >
            →
          </button> */}
        </div>

        {/* <button
          onClick={toggleSidebar}
          className={styles.toggleButton}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={sidebarCollapsed ? "Expand" : "Collapse"}
        >
          {sidebarCollapsed ? "→" : "←"}
        </button> */}
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
    </div>
  );
}

export default Sidebar;
