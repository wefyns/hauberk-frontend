/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useId,
  useLayoutEffect,
  useEffect,
  useMemo,
} from "react";
import { createPortal } from "react-dom";
import styles from "./ActionMenu.module.css";

const ActionMenuContext = createContext(null);

export function useActionMenu() {
  const ctx = useContext(ActionMenuContext);
  if (!ctx) throw new Error("useActionMenu must be used inside <ActionMenu>");
  return ctx;
}

export const ActionMenu = ({ children }) => {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);
  const id = useId();
  return (
    <ActionMenuContext.Provider value={{ anchorRef, open, setOpen, anchorId: id }}>
      <div className={styles.wrapper}>{children}</div>
    </ActionMenuContext.Provider>
  );
};

export const ActionMenuButton = ({ children }) => {
  const { anchorRef, open, setOpen } = useActionMenu();
  return (
    <button
      ref={anchorRef}
      aria-haspopup="menu"
      aria-expanded={open}
      type="button"
      className={styles.button}
      onClick={(e) => {
        e.stopPropagation();
        setOpen(!open);
      }}
    >
      {children}
    </button>
  );
};

export const ActionMenuOverlay = ({
  children,
  placement = "bottom-start",
  closeOnItemClick = true,
  className = "",
  gutter = 8,
  viewportPadding = 8,
}) => {
  const { anchorRef, open, setOpen, anchorId } = useActionMenu();
  const overlayRef = useRef(null);
  const portalRoot = useMemo(() => document.body, []);
  const [style, setStyle] = useState({
    position: "fixed",
    top: -9999,
    left: -9999,
    visibility: "hidden",
    zIndex: 10000,
  });

  useLayoutEffect(() => {
    if (!open || !anchorRef.current) return;

    const rect = anchorRef.current.getBoundingClientRect();
    const initial = { position: "fixed", zIndex: 10000 };

    if (placement.startsWith("bottom")) {
      initial.top = rect.bottom + gutter;
    } else {
      initial.top = rect.top - gutter;
    }

    if (placement.endsWith("start")) {
      initial.left = rect.left;
    } else {
      initial.left = rect.right;
    }

    initial.visibility = "hidden";
    setStyle((s) => ({ ...s, ...initial }));
  }, [open, anchorRef, placement, gutter]);

  useLayoutEffect(() => {
    if (!open) return;
    const overlayEl = overlayRef.current;
    const anchorEl = anchorRef.current;
    if (!overlayEl || !anchorEl) return;

    const rect = anchorEl.getBoundingClientRect();
    const ov = overlayEl.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const pad = viewportPadding;

    let top;
    let left;

    if (placement.startsWith("bottom")) {
      const desiredTop = rect.bottom + gutter;
      const overflowBottom = desiredTop + ov.height + pad - vh;
      if (overflowBottom > 0 && rect.top - gutter - ov.height - pad >= 0) {
        top = rect.top - gutter - ov.height;
      } else {
        top = Math.max(pad, desiredTop);
      }
    } else {
      const desiredTop = rect.top - gutter - ov.height;
      const overflowTop = desiredTop - pad;
      if (overflowTop < 0 && rect.bottom + gutter + ov.height + pad <= vh) {
        top = rect.bottom + gutter;
      } else {
        top = Math.max(pad, desiredTop);
      }
    }

    if (placement.endsWith("start")) {
      left = rect.left;
      if (left + ov.width + pad > vw) {
        left = Math.max(pad, vw - ov.width - pad);
      }
      if (left < pad) left = pad;
    } else {
      const desiredLeft = rect.right - ov.width;
      left = desiredLeft;
      if (left < pad) left = pad;
      if (left + ov.width + pad > vw) {
        left = Math.max(pad, vw - ov.width - pad);
      }
    }

    setStyle({
      position: "fixed",
      top: Math.round(top),
      left: Math.round(left),
      visibility: "visible",
      zIndex: 10000,
    });
  }, [open, placement, gutter, viewportPadding, anchorRef]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      const t = e.target;
      const anchorEl = anchorRef.current;
      const overlayEl = overlayRef.current;
      if (!overlayEl || !anchorEl) return;
      if (!overlayEl.contains(t) && !anchorEl.contains(t)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, setOpen, anchorRef]);

  const onItemClick = (e) => {
    if (!closeOnItemClick) return;
    const target = e.target;
    if (target.closest("[role='menuitem'], button, a")) {
      setOpen(false);
    }
  };

  if (!open || !portalRoot) return null;

  return createPortal(
    <div
      ref={overlayRef}
      className={[styles.overlay, className].filter(Boolean).join(" ")}
      aria-labelledby={anchorId}
      role="menu"
      style={style}
      onClick={onItemClick}
    >
      {children}
    </div>,
    portalRoot
  );
};

ActionMenu.Button = ActionMenuButton;
ActionMenu.Overlay = ActionMenuOverlay;
