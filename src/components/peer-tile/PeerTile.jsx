import React from "react";

import styles from './PeerTile.module.css'

const STATUS_MAP = {
  healthy: "green",
  running: "green",
  available: "green",
  degraded: "yellow",
  warn: "yellow",
  warning: "yellow",
  deployed: "yellow",
  stopped: "red",
  error: "red",
  failed: "red",
  unknown: "gray",
  unavailable: "gray",
  not_deployed: "gray",
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

export function PeerTile({ peer, agent, onClick, type = 'peer' }) {
  const status = peer?.status ?? "";
  const badgeColor = pickBadgeColor(status);

  const peerName =
    peer?.peer_name ??
    peer?.hostname ??
    peer?.host_name ??
    peer?.name ??
    "—";

  const domainName = peer?.domain_name ?? "";
  const portName = peer?.port ?? "";

  const base = domainName && peerName !== "—"
    ? `${peerName}.${domainName}`
    : peerName;

  const fullName = portName
    ? `${base}:${portName}`
    : base;

  const showMSP = type !== 'db' && type !== 'ca';
  const showDomain = type === 'orderer';
  const showStatus = type !== 'db' && type !== 'ca';

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
        <div><strong>Name:</strong> {fullName}</div>
        <div><strong>ID:</strong> {peer?.id ?? "—"}</div>
        <div><strong>Version:</strong> {peer?.version ?? "—"}</div>
        {showMSP && <div><strong>MSP ID:</strong> {peer?.msp_id ?? "—"}</div>}
        {showDomain && <div><strong>Domain:</strong> {domainName || "—"}</div>}
        {showStatus && <div><strong>Status:</strong> {status || "—"}</div>}
      </div>

      <div className={styles.tileFooter}>
        <small>Agent ID: {agent?.id ?? "—"}</small>
      </div>
    </div>
  );
}