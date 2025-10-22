import React, { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";

import { Dialog } from "../../dialog/Dialog";
import { agentService, journalService } from "../../../services";

import { useTaskWebSocket } from "../../../hooks/useTaskWebSocket";

import styles from './NetworkModal.module.css';

export default function NetworkModal({
  visible,
  onClose,
  orgId,
  agentId,
}) {
  const wsRef = useRef(null);
  const fileRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState("");
  const [fileError, setFileError] = useState("");

  const [processingError, setProcessingError] = useState(null);

  const [createdDoc, setCreatedDoc] = useState(null);
  const [createdDocMeta, setCreatedDocMeta] = useState(null);

  const [taskId, setTaskId] = useState(null);
  const [blobUrl, setBlobUrl] = useState(null);

  const { events: wsEvents, closeWebSocket } = useTaskWebSocket(taskId);

  const createDocMutation = useMutation({
    mutationFn: ({file}) => {
      return agentService.createConnectionDocument(orgId, agentId, file);
    },
    onSuccess: (res) => {
      if (res?.status && res.status >= 400) {
        setProcessingError({
          message: res.error || "Ошибка при обработке документа",
          details: res.details ?? null,
          journalId: res.journal_id ?? null,
        });
        setCreatedDoc(null);
        setCreatedDocMeta(null);
        return;
      }

      const doc = res?.connection_document ?? null;
      setCreatedDoc(doc);
      setCreatedDocMeta({
        document_id: doc?.id ?? null,
        journal_id: res?.journal_id ?? null,
      });
      setProcessingError(null);
    },
    onError: (err) => {
      console.error("createConnectionDocument error:", err);
      const payload = err?.response?.data ?? err?.data ?? null;
      const details = payload?.details ?? null;
      const journalId = payload?.journal_id ?? payload?.journalId ?? payload?.journal ?? null;
      setProcessingError({
        message: payload?.message || err?.message || "Ошибка при обработке конфигурационного файла",
        details,
        journalId,
      });
    },
  })

  const connectMutation = useMutation({
    mutationFn: ({ docId }) => agentService.connectWithDocument(orgId, agentId, docId),
    onSuccess: (res) => {
      const t = res?.task_id ?? null;
      if (t) {
        setTaskId(t);
        // setWsEvents((prev) => [...prev, { type: "info", message: `Задача запущена: ${t}` }]);
      } else {
        console.warn("connect response (no task id):", res);
        setProcessingError({ message: "Соединение запущено, но идентификатор задачы id получен не был.", details: res });
      }
    },
    onError: (err) => {
      console.error("connectWithDocument error:", err);
      setProcessingError({ message: err?.message || "Ошибка при запуске подключения", details: err?.response?.data ?? err?.data });
    },
  });

  const onFileSelected = async (e) => {
    setFileError("");
    const f = e.target.files?.[0];
    if (!f) return;
    setSelectedFile(f);

    try {
      const text = await f.text();
      try {
        const parsed = JSON.parse(text);
        setFilePreview(JSON.stringify(parsed, null, 2));
      } catch {
        setFilePreview(text.slice(0, 2000));
      }
    } catch (err) {
      console.error("read file error:", err);
      setFilePreview("");
      setFileError("Файл не может быть прочитан.");
    }
  };

  const onClickPicker = () => fileRef.current?.click();
  // const onClearFile = () => { 
  //   setSelectedFile(null); 
  //   setFilePreview(""); 
  //   setFileError(""); 
  // };

  const onUploadDocument = () => {
    setProcessingError(null);
    setCreatedDoc(null);
    setCreatedDocMeta(null);
    if (!selectedFile) {
      setFileError("Выберите файл конфигурации (.json).");
      return;
    }
    createDocMutation.mutate({ file: selectedFile });
  };

  const onContinueConnect = () => {
    const docId = createdDocMeta?.document_id ?? createdDoc?.id ?? createdDocMeta?.id;

    if (!docId) {
      setProcessingError({ message: "Для продолжения работы нет идентификатора документа." });
      return;
    }
    connectMutation.mutate({ docId });
  };

  function cleanup() {
    try {
      wsRef.current?.close()
    } catch (e) {
      console.warn(e)
    }

    wsRef.current = null;

    if (blobUrl && blobUrl.startsWith("blob:")) {
      URL.revokeObjectURL(blobUrl);
      setBlobUrl(null);
    }

    setSelectedFile(null);
    setFilePreview("");
    setFileError("");
    setProcessingError(null);
    setCreatedDoc(null);
    setCreatedDocMeta(null);
    setTaskId(null);
    closeWebSocket();
    // setWsEvents([]);
  }

  const downloadJournal = async (journalId) => {
    try {
      const data = await journalService.getJournal(orgId, agentId, journalId);
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `journal-${journalId}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("Не удалось скачать журнал");
    }
  };

  useEffect(() => {
    if (!visible) {
      cleanup();
    }
    return () => {
      cleanup();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  return (
    <Dialog
      visible={visible}
      onClose={(reason) => { cleanup(); onClose(reason); }}
      title={`Agent - ${agentId}`}
      width="large"
      height="auto"
      position="center"
      backdropVariant="blur"
      footerButtons={() => {}}
    >
      <div className={styles.networkBody}>
        <input ref={fileRef} type="file" accept=".json,application/json" onChange={onFileSelected} style={{ display: "none" }} />

        <div className={styles.row}>
          <label className={styles.label}>Конфигурационный файл</label>
          <div className={styles.fileArea}>
            <textarea
              readOnly
              className={styles.preview}
              value={filePreview || (selectedFile ? selectedFile.name : "")}
              placeholder="Выберите файл в формате json"
            />
            <div className={styles.fileControls}>
              <button className={styles.btn} onClick={onClickPicker}>…</button>
              {/* <button className={styles.btnSecondary} onClick={onClearFile}>Clear</button> */}
            </div>
          </div>
          {fileError && <div className={styles.error}>{fileError}</div>}
        </div>

        <div className={styles.actionsRow}>
          <button className={styles.ghost} onClick={() => { cleanup(); onClose("custom"); }}>Отменить</button>
          <button className={styles.primary} onClick={onUploadDocument} disabled={createDocMutation.isPending}>
            {createDocMutation.isPending ? "Обработка..." : "Создайте документ"}
          </button>
        </div>


        {createdDoc && (
          <div className={styles.resultBlock}>
            <h4>Созданный документ</h4>
            <pre className={styles.docPreview}>{JSON.stringify(createdDoc, null, 2)}</pre>
            <div className={styles.resultBtns}>
              <button className={styles.ghost} onClick={() => { setCreatedDoc(null); setCreatedDocMeta(null); }}>Закрыть</button>
              <button className={styles.primary} onClick={onContinueConnect} disabled={connectMutation.isPending}>
                {connectMutation.isPending ? "Подключение..." : "Подключить и продолжить"}
              </button>
            </div>
          </div>
        )}

        {taskId && (
          <div className={styles.taskBlock}>
            <h4>Процесс подключения — задача {taskId}</h4>
            <div className={styles.eventsList}>
              {wsEvents.map((ev, idx) => {
                const journalId = ev?.payload?.journal_id ?? ev?.payload?.journalId ?? ev?.payload?.journal;
                const message = ev.type === "event" ? (ev.payload.message ?? JSON.stringify(ev.payload)) : (ev.message ?? ev.raw ?? JSON.stringify(ev));
                return (
                  <div key={idx} className={styles.eventItem}>
                    <div className={styles.eventText}><strong>{ev.type}</strong>: {message}</div>
                    {journalId && <button className={styles.btn} onClick={() => {}}>Журнал</button>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {processingError && (
          <div className={styles.errorBlock}>
            <h4>Ошибка</h4>
            <p className={styles.processingError}>{processingError.message}</p>
            {processingError.details && <pre className={styles.details}>{JSON.stringify(processingError.details, null, 2)}</pre>}
            <div className={styles.errorBtns}>
              {processingError.journalId && (
                <button
                  className={styles.btnD}
                  onClick={() => downloadJournal(processingError.journalId)}
                >
                  Скачать журнал
                </button>
              )}
              <button className={styles.btnSecondary} onClick={() => setProcessingError(null)}>Ок</button>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
}