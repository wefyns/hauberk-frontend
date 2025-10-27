import React from "react";
import { useQuery } from "@tanstack/react-query";

import { generalService } from "../../../services";

import styles from './DbInfoSection.module.css'

export default function DbInfoSection() {
  const q = useQuery({
    queryKey: ["db-info"],
    queryFn: () => generalService.getDbInfo(),
  });

  if (q.isPending) {
    return (
      <section className={styles.section}>
        <div className={styles.header}>
          <h3 className={styles.title}>Информация о СУБД</h3>
        </div>
        <div className={styles.body}>
          <span className={styles.item}>Загрузка...</span>
        </div>
      </section>
    );
  }

  if (q.isError) {
    return (
      <section className={styles.section}>
        <div className={styles.header}>
          <h3 className={styles.title}>Информация о СУБД</h3>
        </div>
        <div className={styles.body}>
          <span className={styles.noItems}>Элементы не найдены.</span>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h3 className={styles.title}>Информация о СУБД</h3>
      </div>

      <div className={styles.tilesGrid}>
        <div className={styles.tileWrapper}>
          <div className={styles.header}>
            <div className={styles.title}>СУБД</div>
          </div>

          {/* <div className={styles.body}>
            <div className={styles.row}>
              <div className={styles.label}>Backend:</div>
              <div className={styles.value}>
                {backend?.type ? `${backend.type}${backend.version ? ` ${backend.version}` : ""}` : "—"}
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.label}>Agent DB:</div>
              <div className={styles.value}>
                {agentDb?.type ? `${agentDb.type}${agentDb.version ? ` ${agentDb.version}` : ""}` : "—"}
              </div>
            </div>

            {!backend?.type && !agentDb?.type && (
              <pre className={styles.raw} aria-hidden>{JSON.stringify(dbInfo, null, 2)}</pre>
            )}
          </div> */}
        </div>
      </div>
    </section>
  )
}