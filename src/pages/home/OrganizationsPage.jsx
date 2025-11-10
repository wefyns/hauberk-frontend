import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useOrganization } from "../../contexts/useOrganization";
import styles from "./OrganizationsPage.module.css";

function OrganizationsPage() {
  const navigate = useNavigate();
  const { organizations, error } = useOrganization();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOrganizations = useMemo(() => {
    if (!searchTerm) return organizations;
    
    return organizations.filter(org => 
      org.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [organizations, searchTerm]);

  // const handleSelectOrganization = (orgId) => {
  //   selectOrganization(orgId);
  //   navigate('/home');
  // };

  const handleCreateOrganization = () => {
    navigate(`/home/create-organization`);
  };

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>Ошибка загрузки</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Организации</h1>
        <p className={styles.subtitle}>
          Управляйте вашими организациями или создайте новую
        </p>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Поиск по названию, домену или региону..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <button 
          onClick={handleCreateOrganization}
          className={styles.createButton}
        >
          + Создать организацию
        </button>
      </div>

      <div className={styles.organizationsList}>
        {filteredOrganizations.length === 0 ? (
          <div className={styles.emptyState}>
            {searchTerm && (
              <>
                <h3>Ничего не найдено</h3>
                <p>Попробуйте изменить поисковый запрос</p>
              </>
            )}
          </div>
        ) : (
          <div className={styles.grid}>
            {filteredOrganizations.map((org) => (
              <div
                key={org.id}
                className={styles.orgCard}
                // onClick={() => handleSelectOrganization(org.id)}
              >
                <div className={styles.orgInfo}>
                  <div className={styles.orgHeader}>
                    <h3 className={styles.orgName}>{org.name}</h3>
                    <span className={styles.orgId}>ID: {org.id}</span>
                  </div>
                
                  <div className={styles.orgDetails}>
                    <div className={styles.detail}>
                      <span className={styles.label}>Домен:</span>
                      <span className={styles.value}>{org.domain_name}</span>
                    </div>
                    
                    <div className={styles.detail}>
                      <span className={styles.label}>Страна:</span>
                      <span className={styles.value}>{org.country}</span>
                    </div>
                    
                    <div className={styles.detail}>
                      <span className={styles.label}>Регион:</span>
                      <span className={styles.value}>{org.region}</span>
                    </div>

                    {org.msp_id && (
                      <div className={styles.detail}>
                        <span className={styles.label}>MSP ID:</span>
                        <span className={styles.value}>{org.msp_id}</span>
                      </div>
                    )}
                  </div>
                </div>
              
                {/* <div className={styles.orgActions}>
                  <button 
                    className={styles.selectButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectOrganization(org.id);
                    }}
                  >
                    Выбрать
                  </button>
                </div> */}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default OrganizationsPage;