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
    loading,
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
    if (path.includes("/organizations")) return "organizations";
    if (path.includes("/channel")) return "channel";
    if (path.includes("/sertificate")) return "sertificate";
    if (path.includes("/smart-contract")) return "smart-contract";
    return "overview";
  };

  useEffect(() => {
    fetchOrganizations();
  }, [currentUser, fetchOrganizations]);

  // useEffect(() => {
  //   if (orgId && organizations.length > 0) {
  //     const orgIdNum = parseInt(orgId);
  //     const org = organizations.find(o => o.id === orgIdNum);
  //     if (org && (!selectedOrganization || selectedOrganization.id !== orgIdNum)) {
  //       pickOrganization(orgIdNum);
  //     }
  //   }
  // }, [orgId, organizations, selectedOrganization, pickOrganization]);

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

      if (!orgId) {
        const firstOrg = organizations[0];
        navigate(`/home/${firstOrg.id}`, { replace: true });
        return;
      }

      pickOrganization(parseInt(orgId));
    };

    checkAccess();
  }, [
    currentUser,
    orgId,
    selectedOrganization,
    organizations,
    loading,
    navigate,
    selectOrganization,
    pickOrganization,
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
