import React, { useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { agentService } from "../../services/agentService";
import { useAuthContext } from "../../contexts/useAuth";
import styles from "../Home.module.css";

export default function Network() {
  const { orgId, agentId } = useParams();
  const navigate = useNavigate();
  
  const { logoutFromApp } = useAuthContext();

  const wsRef = useRef(null);
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState("");
  const [fileError, setFileError] = useState("");

  const [doc, setDoc] = useState(null);
  const [docMeta, setDocMeta] = useState(null);
  const [processingError, setProcessingError] = useState(null);

  const [taskId, setTaskId] = useState(null);
  const [wsEvents, setWsEvents] = useState([]);

  const create = useMutation({
    mutationFn: ({ orgId, agentId, file }) =>
      agentService.createConnectionDocument(orgId, agentId, file),
    onSuccess: (res) => {
      setDoc(res.document ?? res);
      setDocMeta({
        document_id: res.document_id || '',
        journal_id: res.journal_id || '',
      });
      setProcessingError(null);
    },
     onError: (err) => {
      console.error("createConnectionDocument error:", err);
      const payload = err?.response?.data ?? err?.data ?? null;
      const details = (payload && payload.details) || null;
      const journalId = (payload && payload.journal_id) || null;
      setProcessingError({
        message: err.message || "Ошибка при обработке конфигурационного файла",
        details,
        journalId,
      });
    },
  })

  const connect = useMutation({
    mutationFn: ({ orgId, agentId, docId }) =>
      agentService.connectWithDocument(orgId, agentId, docId),
    onSuccess: (res) => {
      const t = res.task_id || '';
      if (!t) {
        console.warn("No task id in connect response:", res);
      } else {
        setTaskId(t);
      }
    },
    onError: (err) => {
      console.error("connectWithDocument error:", err);
      setProcessingError({ message: err.message || "Ошибка при запуске подключения", details: err?.response?.data });
    },
  });

  const onFileSelected = async (e) => {
    setFileError("");
    const f = e.target.files?.[0];

     if (!f) return;
    setSelectedFile(f);
  }

   const onClickPicker = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={styles.sectionContent}>
      <div className={styles.sectionHeader}>
        <h2>Network — Выбор конфигурационного файла</h2>
      </div>

      <div className={styles.addForm}>
        <label className={styles.label}>Конфигурационный файл</label>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            ref={fileInputRef}
            type="file"
            onChange={onFileSelected}
            style={{ display: "none" }}
          />

          <div style={{
            flex: 1,
            display: "flex",
            alignItems: "stretch",
            gap: 8,
          }}>
            <textarea
              readOnly
              value={filePreview || (selectedFile ? selectedFile.name : "")}
              placeholder="Показывается содержимое выбранного файла (.json) или имя файла"
              style={{
                width: "100%",
                minHeight: 160,
                resize: "vertical",
                padding: 12,
                borderRadius: 8,
                border: "1px solid rgba(0,0,0,0.08)",
                fontFamily: "monospace",
                whiteSpace: "pre",
                overflow: "auto",
              }}
            />

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button type="button" className={styles.addButton} onClick={onClickPicker} title="Выбрать файл">…</button>
              <button type="button" className={styles.cancelButton} onClick={() => { setSelectedFile(null); setFilePreview(""); }} title="Очистить">✕</button>
            </div>
          </div>
        </div>

        {fileError && <p className={styles.error}>{fileError}</p>}
      </div>
    </div>
  );
}