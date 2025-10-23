import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";

import Navbar from "../components/navbar/Navbar";
import Sidebar from "../components/layout/Sidebar";

import { Pages } from "../constants/routes";
import { useAuthContext } from "../contexts/useAuth";
import { useOrganization } from "../contexts/useOrganization";

import styles from "./Home.module.css";

function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const { orgId } = useParams();
  const { currentUser } = useAuthContext();
  const {
    selectedOrganization,
    selectOrganization,
    organizations,
    fetchOrganizations,
    pickOrganization,
  } = useOrganization();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Determine active section from URL path
  const getActiveSection = () => {
    const path = location.pathname;
    if (path.includes("/search")) return "search";
    if (path.includes("/agents")) return "agents";
    if (path.includes("/secrets")) return "secrets";
    if (path.includes("/channel")) return "channel";
    if (path.includes("/sertificate")) return "sertificate";
    if (path.includes("/smart-contract")) return "smart-contract";
    return "overview";
  };

  useEffect(() => {
    fetchOrganizations();
  }, [currentUser]);

  // Check user authentication and organization
  useEffect(() => {
    const checkAccess = async () => {
      if (!currentUser) return;

      if (!currentUser?.license_accepted) {
        navigate(Pages.Onboarding);
        return;
      }
      if (!currentUser?.email_confirmed) {
        navigate(Pages.SetEmailPassword);
        return;
      }

      // If no organization ID in URL, redirect to organizations
      if (!orgId || orgId === ":orgId") {
        navigate(Pages.Organizations);
        return;
      }

      pickOrganization(orgId);
    };

    checkAccess();
  }, [
    currentUser,
    orgId,
    selectedOrganization,
    organizations,
    navigate,
    selectOrganization,
  ]);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Redirect if no organization
  if (!selectedOrganization && orgId) {
    return <div>Loading organization...</div>;
  }

  return (
    <div className={styles.homeContainer}>
      {/* Sidebar */}
      <Sidebar
        sidebarCollapsed={sidebarCollapsed}
        toggleSidebar={toggleSidebar}
        activeSection={getActiveSection()}
        orgId={orgId}
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
