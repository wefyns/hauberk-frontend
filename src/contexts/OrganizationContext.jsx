import { createContext, useState, useCallback, useRef } from "react";
import { organizationService } from "../services/organizationService";

// Create the context
const OrganizationContext = createContext();

export const OrganizationProvider = ({ children }) => {
  const initializedRef = useRef(false);

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
      const orgs = data?.organizations || [];
      setOrganizations(orgs);
      
      if (orgs.length > 0 && !initializedRef.current) {
        const storedOrgId = localStorage.getItem("selectedOrganizationId");
        let orgToSelect = orgs[0];
        
        if (storedOrgId) {
          const storedOrg = orgs.find((org) => org.id === parseInt(storedOrgId));
          if (storedOrg) {
            orgToSelect = storedOrg;
          }
        }
        
        setSelectedOrganization(orgToSelect);
        localStorage.setItem("selectedOrganizationId", orgToSelect.id);
        initializedRef.current = true;
      }

      setLoading(false);
      return orgs;
    } catch (err) {
      setError(err.message || "Failed to fetch organizations");
      setLoading(false);
      return [];
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
