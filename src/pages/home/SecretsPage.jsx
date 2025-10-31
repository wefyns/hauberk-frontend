import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";

import { useParams } from "react-router-dom";

import { secretService } from "../../services/secretService";
import AddSecretModal from "../../components/modals/add-secret-modal/AddSecretModal";

import styles from "../Home.module.css";

function SecretsPage() {
  const { orgId } = useParams();

  const [filter, setFilter] = useState("");
  const [editingSecret, setEditingSecret] = useState(null);
  const [addSecretModalOpen, setAddSecretModalOpen] = useState(false);

  const {
    data: secrets,
    isLoading: loading,
    refetch: refetchSecrets,
  } = useQuery({
    queryKey: ["secrets", orgId],
    queryFn: () => secretService.getSecrets(),
    enabled: !!orgId,
    select: (data) => data?.secrets || [],
  });

  const filterData = useMemo(() => {
    if (!filter || filter.trim() === "") return secrets || [];
    const q = filter.trim().toLowerCase();
    return (secrets || []).filter((s) => {
      if (!s) return false;
      const mark = String(s.secret_mark || "").toLowerCase();
      const type = String(s.secret_type || "").toLowerCase();
      const id = String(s.id || "").toLowerCase();
      return mark.includes(q) || type.includes(q) || id.includes(q);
    });
  }, [secrets, filter]);

  const noDataOrFound = (secrets?.length || 0) === 0;

  const handleOpenCreate = () => {
    setEditingSecret(null);
    setAddSecretModalOpen(true);
  };

  const handleCardClick = (secret) => {
    setEditingSecret(secret);
    setAddSecretModalOpen(true);
  };

 return (
    <>
      <div className={styles.top}>
        <div className={styles.wrapperInput}>
          <div style={{ position: "relative" }}>
            <input
              className={styles.inputSearch}
              value={filter}
              placeholder="Поиск по маркеру, типу или ID"
              onChange={(e) => setFilter(e.target.value)}
              style={{ paddingLeft: 36, height: 40, borderRadius: 0 }}
            />
          </div>
        </div>

        <button
          type="button"
           className={`${styles.button}`}
          onClick={handleOpenCreate}
        >
          + Добавить секрет
        </button>
      </div>

      {loading && (
        <div style={{ padding: 32, display: "flex", justifyContent: "center" }}>
          <div className={styles.loader}>Загрузка...</div>
        </div>
      )}

      {!loading && (
        <div className={(noDataOrFound && filterData.length === 0) ? styles.wrapperBottom : styles.content}>
          {noDataOrFound && filterData.length === 0 ? (
            <div className={styles.notFound}>
              <div className={styles.textNotFound}>Секретов пока нет</div>
              <div style={{ marginTop: 16 }}>
                <button type="button" className={styles.invite} onClick={handleOpenCreate}>Создайте первый секрет</button>
              </div>
            </div>
          ) : filterData.length === 0 ? (
            <div className={styles.wrapperBottom}>
              <div className={styles.textNotFound}>Ничего не найдено по запросу «{filter}»</div>
            </div>
          ) : (
            (filterData || []).map((secret) => (
              <div
                key={secret.id}
                className={styles.wrapperCounterparty}
                onClick={() => handleCardClick(secret)}
                role="button"
                tabIndex={0}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
              >
                <div className={styles.info}>
                  <div className={styles.wrapperTop}>
                    <div>
                      <div className={styles.orgHeader}>
                        <div className={styles.name}>{secret.secret_mark}</div>
                        <span className={styles.orgId}>ID: {secret.id}</span>
                      </div>
                      <div className={styles.description}>
                        <div className={styles.reduction}>Тип:</div>
                        <div className={styles.value}>{secret.secret_type}</div>
                        <div style={{ width: 24 }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    type="button"
                    className={`${styles.button} ${styles.buttonOutlineGreen}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingSecret(secret);
                      setAddSecretModalOpen(true);
                    }}
                  >
                    Редактировать
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {addSecretModalOpen && (
        <AddSecretModal
          visible={addSecretModalOpen}
          onClose={() => {
            setAddSecretModalOpen(false);
            setEditingSecret(null);
          }}
          orgId={orgId}
          editingSecret={editingSecret}
          onSuccess={() => {
            refetchSecrets();
            setAddSecretModalOpen(false);
            setEditingSecret(null);
          }}
        />
      )}
    </>
  );
}

export default SecretsPage;
