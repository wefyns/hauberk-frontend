import React from "react";

import styles from './PeerTile.module.css'

const STATUS_MAP = {
  healthy: "green",
  running: "green",
  available: "green",
  degraded: "yellow",
  warn: "yellow",
  warning: "yellow",
  stopped: "red",
  error: "red",
  failed: "red",
  unknown: "gray",
  unavailable: "gray",
  deployed: "gray",
  "": "gray",
};

function pickBadgeColor(statusRaw) {
  if (!statusRaw && statusRaw !== "") return "gray";
  const s = String(statusRaw).trim().toLowerCase();

  for (const key of Object.keys(STATUS_MAP)) {
    if (key && s.includes(key)) return STATUS_MAP[key];
  }

  return STATUS_MAP[s] ?? "gray";
}

export function PeerTile({ peer, agent, onClick }) {
  const status = peer?.status ?? "";
  const badgeColor = pickBadgeColor(status);

  return (
    <div className={styles.tile} onClick={onClick} role="button" tabIndex={0}>
      <div className={styles.tileHeader}>
        <div
          className={styles.statusBadge}
          data-color={badgeColor}
          title={status || "unknown"}
          aria-hidden
        />
      </div>

      <div className={styles.tileBody}>
        <div><strong>Name:</strong> {peer?.peer_name ?? peer?.hostname ?? peer?.host_name ?? "—"}</div>
        <div><strong>ID:</strong> {peer?.id ?? "—"}</div>
        <div><strong>Version:</strong> {peer?.version ?? "—"}</div>
        <div><strong>MSP:</strong> {peer?.msp_id ?? "—"}</div>
        <div><strong>Domain:</strong> {peer?.domain_name ?? "—"}</div>
        <div><strong>Status:</strong> {status || "—"}</div>
      </div>

      <div className={styles.tileFooter}>
        <small>Agent ID: {agent?.id ?? "—"}</small>
      </div>
    </div>
  );
}