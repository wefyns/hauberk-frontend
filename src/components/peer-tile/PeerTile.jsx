import React from "react";

import styles from './PeerTile.module.css'

const STATUS_MAP = {
  healthy: "green",
  running: "green",
  ok: "green",
  degraded: "yellow",
  warn: "yellow",
  warning: "yellow",
  stopped: "red",
  error: "red",
  failed: "red",
  unknown: "gray",
  unavailable: "gray",
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
  const status = peer?.agent_status ?? peer?.status ?? "";
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
        <div><strong>Version:</strong> {peer?.version ?? "—"}</div>
        <div><strong>MSP:</strong> {peer?.msp_id ?? "—"}</div>
        <div><strong>Network:</strong> {peer?.network_name ?? peer?.network ?? "—"}</div>
        {status && <div><strong>Status:</strong> {status}</div>}
      </div>

      <div className={styles.tileFooter}>
        <small>Agent: {agent?.id ?? agent?.name ?? "—"}</small>
      </div>
    </div>
  );
}