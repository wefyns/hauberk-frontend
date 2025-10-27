import React, { useEffect, useCallback, ReactNode } from "react";
import { createPortal } from "react-dom";
import styles from "./Dialog.module.css";

const heightMap = {
  smallest: "300px",
  small: "480px",
  large: "800px",
  auto: "auto",
};

const widthMap = {
  small: "296px",
  medium: "500px",
  large: "690px",
  xlarge: "840px",
};

const portalRootId = "hauberk_dialog_portal";

function ensurePortalRoot() {
  let root = document.getElementById(portalRootId);
  if (!root) {
    root = document.createElement("div");
    root.id = portalRootId;
    document.body.appendChild(root);
  }
  return root;
}

export const Dialog = ({
  visible,
  onClose,
  title,
  subtitle,
  footerButtons,
  width = "xlarge",
  height = "auto",
  position = "center",
  children,
  customHeader,
  customFooter,
  noOverflowHidden = false,
  hideFooter = false,
  headerClassName,
  footerClassName,
}) => {
  const onKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") {
        onClose("escape");
        e.preventDefault();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (visible) {
      document.addEventListener("keydown", onKeyDown);
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", onKeyDown);
        document.body.style.overflow = prev || "";
      };
    }
    return;
  }, [visible, onKeyDown]);

  if (!visible) return null;

  const dataAttrs =
    typeof position === "string"
      ? {
          "data-position-regular": position,
          "data-position-narrow": position,
        }
      : {
          "data-position-regular": position.regular,
          "data-position-narrow": position.narrow,
        };

  const sizeStyle = {
    width: widthMap[width],
    height: heightMap[height],
  };

  const portalRoot = ensurePortalRoot();

  return createPortal(
    <div
      className={styles.backdrop}
      {...dataAttrs}
      onClick={() => onClose("close-button")}
      role="presentation"
    >
      <div
        className={[
          styles.dialog,
          noOverflowHidden ? styles.noOverflow : "",
          customFooter ? styles.customFooter : "",
          headerClassName || ""
        ].join(" ")}
        {...dataAttrs}
        style={sizeStyle}
        role="dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {customHeader ? (
          customHeader
        ) : (
          <header className={styles.header}>
            <h2 id="dialog-title" className={styles.title}>
              {title ?? "Dialog"}
            </h2>
            <button
              className={styles.closeBtn}
              onClick={() => onClose("close-button")}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M6 6L18 18M6 18L18 6" stroke="#333" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </header>
        )}

        <div className={styles.body}>
          {subtitle && (
            <p id="dialog-subtitle" className={styles.subtitle}>
              {subtitle}
            </p>
          )}
          {children}
        </div>

        {!hideFooter &&
          (customFooter ? (
            <div className={[styles.footer, footerClassName].join(" ")}>
              {typeof customFooter === "function" ? customFooter() : customFooter}
            </div>
          ) : (
            footerButtons &&
            footerButtons.length > 0 && (
              <footer className={[styles.footer, footerClassName].join(" ")}>
                {footerButtons.map((btn, i) => (
                  <button
                    key={i}
                    className={styles.button}
                    onClick={btn.onClick}
                  >
                    {btn.content}
                  </button>
                ))}
              </footer>
            )
          ))}
      </div>
    </div>,
    portalRoot
  );
};
