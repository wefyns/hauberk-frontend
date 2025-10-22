import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { agentService } from "../../services";
import styles from "../Home.module.css";

function PeerTile({ peer, agent, onClick }) {
  const status = peer?.status ?? peer?.connection_status ?? "";

  const badgeColor =
    status === "healthy" || status === "running"
      ? "green"
      : status === "degraded" || status === "warn"
      ? "yellow"
      : status
      ? "red"
      : "gray";

  return (
    <div className={styles.tile} onClick={onClick} role="button" tabIndex={0}>
      <div className={styles.tileHeader}>
        <div className={styles.tileTitle}>{peer?.id ?? peer?.name ?? "—"}</div>
        <div
          className={styles.statusBadge}
          data-color={badgeColor}
          title={status || "unknown"}
        />
      </div>
      <div className={styles.tileBody}>
        <div>
          <strong>Version:</strong> {peer?.version ?? "—"}
        </div>
        <div>
          <strong>MSP:</strong> {peer?.msp_id ?? "—"}
        </div>
        <div>
          <strong>Network:</strong> {peer?.network_name ?? peer?.network ?? "—"}
        </div>
      </div>
      <div className={styles.tileFooter}>
        <small>Agent: {agent?.id ?? agent?.name ?? "—"}</small>
      </div>
    </div>
  );
}

export default function PeersPage() {
  const { orgId } = useParams();
  const navigate = useNavigate();

  const peersQuery = useQuery({
    queryKey: ["peer", orgId],
    enabled: !!orgId,
    queryFn: () => {
      return agentService.getAllPeersInOrg(orgId);
    },
  });

  if (peersQuery.isPending) {
    return <div>Loading peers…</div>;
  }

  if (peersQuery.isError) {
    return <div>Error loading peers: {String(peersQuery.error)}</div>;
  }

  const items = peersQuery.data ?? [];

  return (
    <div className={styles.sectionContent}>
      <h2>Peers</h2>

      <div className={styles.tilesGrid}>
        {items.length === 0 && <div>No peers found.</div>}
        {items.map(({ peer, agent }) => {
          const peerId = peer?.id ?? peer?.name ?? Math.random().toString(36).slice(2);
          const key = `${agent?.id ?? "a"}-${peerId}`;
          return (
            <PeerTile
              key={key}
              peer={peer}
              agent={agent}
              onClick={() =>
                navigate(
                  `/organizations/${orgId}/agents/${agent.id}/peers/${encodeURIComponent(
                    peerId
                  )}`
                )
              }
            />
          );
        })}
      </div>
    </div>
  );
}