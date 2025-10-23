import React from "react";
import styles from './Switch.module.css';

export function Switch({ checked, onChange }) {
  return (
    <label className={styles.switch}>
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className={styles.slider}></span>
    </label>
  );
}
