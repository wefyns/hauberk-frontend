import { useEffect, useState, useRef } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import Navbar from "../components/navbar/Navbar";
import Sidebar from "../components/layout/Sidebar";

import { Pages } from "../constants/routes";
import { useAuthContext } from "../contexts/useAuth";
import { useOrganization } from "../contexts/useOrganization";

import styles from "./Home.module.css";

function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const fetchedRef = useRef(false);
  
  const { currentUser } = useAuthContext();
  const {
    selectedOrganization,
    organizations,
    loading,
    fetchOrganizations,
  } = useOrganization();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Determine active section from URL path
  const getActiveSection = () => {
    const path = location.pathname;
    if (path.match(/\/agents\/\d+\/(peers|orderers|ca)\//)) return "overview";
    if (path.includes("/search")) return "search";
    if (path.includes("/agents")) return "agents";
    if (path.includes("/secrets")) return "secrets";
    if (path.includes("/organizations")) return "organizations";
    if (path.includes("/channel")) return "channel";
    if (path.includes("/sertificate")) return "sertificate";
    if (path.includes("/smart-contract")) return "smart-contract";
    return "overview";
  };

  useEffect(() => {
    if (!fetchedRef.current && currentUser) {
      fetchedRef.current = true;
      fetchOrganizations();
    }
  }, [currentUser, fetchOrganizations]);

  useEffect(() => {
    const checkAccess = async () => {
      if (!currentUser) return;

      if (!currentUser?.license_accepted) {
        navigate(Pages.Onboarding, { replace: true });
        return;
      }
      
      if (!currentUser?.email_confirmed) {
        navigate(Pages.SetEmailPassword, { replace: true });
        return;
      }

      if (loading) return;

      if (organizations.length === 0) {
        navigate(Pages.CreateOrganization, { replace: true });
        return;
      }
    };

    checkAccess();
  }, [
    currentUser,
    selectedOrganization,
    organizations,
    loading,
    navigate,
  ]);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className={styles.homeContainer}>
      {/* Sidebar */}
      <Sidebar
        sidebarCollapsed={sidebarCollapsed}
        toggleSidebar={toggleSidebar}
        activeSection={getActiveSection()}
      />

      {/* Main content */}
      <div 
        className={styles.navContainer}>
        <Navbar currentUser={currentUser} />
        <div  
          className={`${styles.mainContent} ${
            sidebarCollapsed ? styles.expanded : ""
          }`}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default Home;
