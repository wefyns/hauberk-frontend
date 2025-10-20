import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useOrganization } from "../../contexts/useOrganization";
import { useAuthContext } from "../../contexts/useAuth";
import { Pages } from "../../constants/routes";
import styles from "./Organizations.module.css";

function Organizations() {
  const navigate = useNavigate();
  const { logoutFromApp } = useAuthContext();
  const { 
    organizations, 
    loading, 
    error, 
    fetchOrganizations, 
    selectOrganization 
  } = useOrganization();

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  useEffect(() => {
    // If no organizations exist, redirect to create organization
    if (!loading && organizations.length === 0) {
      navigate(Pages.CreateOrganization);
    }
  }, [loading, organizations.length, navigate]);

  const handleSelectOrganization = (orgId) => {
    selectOrganization(orgId);
    navigate(`/home/${orgId}`);
  };

  const handleCreateOrganization = () => {
    navigate(Pages.CreateOrganization);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingSpinner}>Loading organizations...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>Error loading organizations</h2>
          <p>{error}</p>
          <button onClick={fetchOrganizations} className={styles.retryButton}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.logo}>Hauberk</div>
        <button onClick={logoutFromApp} className={styles.logoutButton}>
          Logout
        </button>
      </div>

      <div className={styles.content}>
        <h1 className={styles.title}>Select Organization</h1>
        <p className={styles.subtitle}>Choose an organization to continue</p>

        <div className={styles.organizationsList}>
          {(organizations ?? [])?.map((org) => (
            <div
              key={org.id}
              className={styles.organizationCard}
              onClick={() => handleSelectOrganization(org.id)}
            >
              <h3 className={styles.orgName}>{org.name}</h3>
              <p className={styles.orgDetails}>
                {org.country} • {org.region}
              </p>
              <p className={styles.orgDomain}>{org.domain}</p>
            </div>
          ))}
        </div>

        <button 
          onClick={handleCreateOrganization}
          className={styles.createButton}
        >
          + Create New Organization
        </button>
      </div>
    </div>
  );
}

export default Organizations;