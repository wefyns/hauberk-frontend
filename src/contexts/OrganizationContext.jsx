import { createContext, useState, useEffect, useCallback } from "react";
import { organizationService } from "../services/organizationService";

// Create the context
const OrganizationContext = createContext();

export const OrganizationProvider = ({ children }) => {
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrganization, setSelectedOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch organizations
  const fetchOrganizations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await organizationService.getOrganizations();
      console.log("Fetched organizations:", data);
      setOrganizations(data?.organizations || []);

      setLoading(false);
    } catch (err) {
      setError(err.message || "Failed to fetch organizations");
      setLoading(false);
    }
  }, []);

  // Select organization
  const selectOrganization = useCallback(
    (organizationId) => {
      const org = organizations.find((org) => org.id === organizationId);
      if (org) {
        setSelectedOrganization(org);
        // Save to local storage
        localStorage.setItem("selectedOrganizationId", organizationId);
      }
    },
    [organizations]
  );

  // Check for previously selected organization on mount
  useEffect(() => {
    const storedOrgId = localStorage.getItem("selectedOrganizationId");
    if (storedOrgId && organizations.length > 0) {
      const org = organizations.find((org) => org.id === parseInt(storedOrgId));
      if (org) {
        setSelectedOrganization(org);
      }
    }
  }, [organizations]);

  // Clear selected organization
  const clearSelectedOrganization = useCallback(() => {
    setSelectedOrganization(null);
    localStorage.removeItem("selectedOrganizationId");
  }, []);

  const pickOrganization = useCallback(
    (id) => {
      const org = organizations.find((org) => org.id === id);
      if (org) {
        setSelectedOrganization(org);
      }
    },
    [organizations]
  );

  return (
    <OrganizationContext.Provider
      value={{
        organizations,
        selectedOrganization,
        loading,
        error,
        pickOrganization,
        fetchOrganizations,
        selectOrganization,
        clearSelectedOrganization,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
};

export { OrganizationContext };
