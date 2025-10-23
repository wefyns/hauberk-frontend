import { useNavigate } from "react-router-dom";

import { Logo } from "../logo/Logo";

import agentIconUrl from '../../assets/images/agent.svg'
import secretIconUrl from '../../assets/images/secret.svg'
import overviewIconUrl from '../../assets/images/overview.svg'
import channelIconUrl from '../../assets/images/channel.svg'
import smartIconUrl from '../../assets/images/smart.svg'
import sertificateIconUrl from '../../assets/images/sertificate.svg'
import searchIconUrl from '../../assets/images/search.svg'

import styles from "../../pages/Home.module.css";

function Sidebar({ sidebarCollapsed, activeSection, orgId }) {
  const navigate = useNavigate();

  const handleSectionClick = (section) => {
    navigate(`/home/${orgId}/${section}`);
  };

  const handleOverviewClick = () => {
    navigate(`/home/${orgId}/`);
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
        </div>

      </div>

      <nav className={styles.sidebarNav}>
        <button
          className={`${styles.navItem} ${
            activeSection === "overview" ? styles.active : ""
          }`}
          onClick={() => handleOverviewClick()}
        >
          <span className={styles.navIcon}>
            <img src={overviewIconUrl} alt="overview icon" />
          </span>
          {!sidebarCollapsed && <span className={styles.navText}>Overview</span>}
        </button>

        <button
          className={`${styles.navItem} ${
            activeSection === "agents" ? styles.active : ""
          }`}
          onClick={() => handleSectionClick("agents")}
        >
          <span className={styles.navIcon}>
            <img src={agentIconUrl} alt="agent icon" />
          </span>
          {!sidebarCollapsed && <span className={styles.navText}>Agents</span>}
        </button>

        <button
          className={`${styles.navItem} ${
            activeSection === "secrets" ? styles.active : ""
          }`}
          onClick={() => handleSectionClick("secrets")}
        >
          <span className={styles.navIcon}>
            <img src={secretIconUrl} alt="secret icon" />
          </span>
          {!sidebarCollapsed && <span className={styles.navText}>Secrets</span>}
        </button>

        <button
          className={`${styles.navItem} ${
            activeSection === "channel" ? styles.active : ""
          }`}
          onClick={() => {}}
          data-component='disabled'
        >
          <span className={styles.navIcon}>
            <img src={channelIconUrl} alt="channel icon" />
          </span>
          {!sidebarCollapsed && <span className={styles.navText}>Channel</span>}
        </button>

        <button
          className={`${styles.navItem} ${
            activeSection === "smart-contract" ? styles.active : ""
          }`}
          onClick={() => {}}
          data-component='disabled'
        >
          <span className={styles.navIcon}>
            <img src={smartIconUrl} alt="smart contract icon" />
          </span>
          {!sidebarCollapsed && <span className={styles.navText}>Smart contract</span>}
        </button>

        <button
          className={`${styles.navItem} ${
            activeSection === "sertificate" ? styles.active : ""
          }`}
          onClick={() => {}}
          data-component='disabled'
        >
          <span className={styles.navIcon}>
            <img src={sertificateIconUrl} alt="sertificate icon" />
          </span>
          {!sidebarCollapsed && <span className={styles.navText}>Sertificate</span>}
        </button>

        <button
          className={`${styles.navItem} ${
            activeSection === "search" ? styles.active : ""
          }`}
          onClick={() => {}}
          data-component='disabled'
        >
          <span className={styles.navIcon}>
            <img src={searchIconUrl} alt="search icon" />
          </span>
          {!sidebarCollapsed && <span className={styles.navText}>Search</span>}
        </button>
      </nav>
    </div>
  );
}

export default Sidebar;
