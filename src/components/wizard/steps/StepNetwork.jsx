import React, { useEffect, useCallback, useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { agentService, journalService } from "../../../services";
import { useTaskWebSocket } from "../../../hooks/useTaskWebSocket";
import styles from "./Steps.module.css";

export function StepNetwork({ registerSubmit, orgId, agentId }) {
  const submitWrapperRef = useRef(null);
  const fileRef = useRef(null);
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState("");
  const [fileError, setFileError] = useState("");
  
  const [processingError, setProcessingError] = useState(null);
  
  const [createdDoc, setCreatedDoc] = useState(null);
  const [createdDocMeta, setCreatedDocMeta] = useState(null);
  
  const [taskId, setTaskId] = useState(null);
  const [viewMode, setViewMode] = useState("idle");
  const [networkConnected, setNetworkConnected] = useState(false);

  const { events: wsEvents, closeWebSocket } = useTaskWebSocket(taskId);

  const createDocMutation = useMutation({
    mutationFn: ({file}) => {
      return agentService.createConnectionDocument(orgId, agentId, file);
    },
    onMutate: () => {
      setProcessingError(null);
      setCreatedDoc(null);
      setCreatedDocMeta(null);
      setTaskId(null);
      setViewMode(selectedFile ? "uploaded" : "idle");
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
        setViewMode("error");
        return;
      }

      const doc = res?.connection_document ?? null;
      setCreatedDoc(doc);
      setCreatedDocMeta({
        document_id: doc?.id ?? null,
        journal_id: res?.journal_id ?? null,
      });
      setProcessingError(null);
      setViewMode("created");
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
      setViewMode("error");
    },
  });

  const connectMutation = useMutation({
    mutationFn: ({ docId }) => agentService.connectWithDocument(orgId, agentId, docId),
    onSuccess: (res) => {
      const t = res?.task_id ?? null;
      if (t) {
        setTaskId(t);
        setViewMode("task");
      } else {
        setViewMode("error");
        console.warn("connect response (no task id):", res);
        setProcessingError({ message: "Соединение запущено, но идентификатор задачи id получен не был.", details: res });
      }
    },
    onError: (err) => {
      setViewMode("error");
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
      setViewMode("uploaded");
    } catch (err) {
      console.error("read file error:", err);
      setFilePreview("");
      setFileError("Файл не может быть прочитан.");
      setViewMode("idle");
    }
  };

  const onClickPicker = () => {
    fileRef.current?.click();
    setViewMode("idle");
  };

  const onUploadDocument = () => {
    setProcessingError(null);
    setCreatedDoc(null);
    setCreatedDocMeta(null);
    if (!selectedFile) {
      setFileError("Выберите файл конфигурации (.json).");
      setViewMode("idle");
      return;
    }
    createDocMutation.mutate({ file: selectedFile });
  };

  const onContinueConnect = () => {
    const docId = createdDocMeta?.document_id ?? createdDoc?.id ?? createdDocMeta?.id;

    if (!docId) {
      setViewMode("error");
      setProcessingError({ message: "Для продолжения работы нет идентификатора документа." });
      return;
    }
    connectMutation.mutate({ docId });
  };

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

  const handleWizardSubmit = useCallback(async () => {
    if (networkConnected) {
      return { 
        success: true, 
        meta: { 
          networkConfigured: true,
          wizardCompleted: true 
        } 
      };
    }

    return {
      success: false,
      error: "Сначала подключитесь к сети"
    };
  }, [networkConnected]);

  useEffect(() => {
    submitWrapperRef.current = handleWizardSubmit;
  }, [handleWizardSubmit]);

  useEffect(() => {
    if (orgId && agentId) {
      if (networkConnected) {
        registerSubmit(() => submitWrapperRef.current());
      } else {
        registerSubmit(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId, agentId, networkConnected]);

  useEffect(() => {
    if (wsEvents.length > 0) {
      const lastEvent = wsEvents[wsEvents.length - 1];
      if (lastEvent.type === "success" || 
          (lastEvent.type === "event" && lastEvent.payload?.status === "completed")) {
        setNetworkConnected(true);
        setViewMode("connected");
        closeWebSocket();
      } else if (lastEvent.type === "error") {
        setViewMode("error");
        setProcessingError({ 
          message: lastEvent.message || "Ошибка подключения к сети",
          details: lastEvent.payload 
        });
        closeWebSocket();
      }
    }
  }, [wsEvents, closeWebSocket]);

  useEffect(() => {
    return () => {
      closeWebSocket();
    };
  }, [closeWebSocket]);

  if (!orgId || !agentId) {
    return (
      <div className={styles.stepContainer}>
        <div className={styles.stepContent}>
          <div className={styles.errorMessage}>
            Ошибка: Необходимо создать организацию и агента для подключения к сети
          </div>
        </div>
      </div>
    );
  }

  if (networkConnected) {
    return (
      <div className={styles.stepContainer}>
        <div className={styles.stepContent}>
          <div className={styles.successState}>
            <h3 className={styles.successTitle}>Сеть готова к работе!</h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.stepContainer}>
      <div className={styles.stepContent}>
        <h2 className={styles.stepTitle}>Завершение настройки сети</h2>

        <input 
          ref={fileRef} 
          type="file" 
          accept=".json,application/json" 
          onChange={onFileSelected} 
          style={{ display: "none" }} 
        />

        {(viewMode === 'idle' || viewMode === 'uploaded') && (
          <>
            <div className={styles.fileSection}>
              <label className={styles.label}>Конфигурационный файл</label>
              <div className={styles.fileArea}>
                {selectedFile && (
                  <textarea
                    readOnly
                    className={styles.preview}
                    value={filePreview || (selectedFile ? selectedFile.name : "")}
                    placeholder="Выберите файл в формате json"
                  />
                )}
              </div>

              {viewMode === 'uploaded' ? (
                <div className={styles.actionsRow}>
                  <button className={styles.primary} onClick={onUploadDocument} disabled={createDocMutation.isPending}>
                    {createDocMutation.isPending ? "Обработка..." : "Создайте документ"}
                  </button>
                </div>
              ) : (
                <div className={styles.fileControls}>
                  <button className={styles.btn} onClick={onClickPicker}>...</button>
                </div>
              )}

              {fileError && <div className={styles.error}>{fileError}</div>}
            </div>
          </>
        )}

        {viewMode === "created" && createdDoc && (
          <div className={styles.resultBlock}>
            <h4>Созданный документ</h4>
            <pre className={styles.docPreview}>{JSON.stringify(createdDoc, null, 2)}</pre>
            <div className={styles.resultBtns}>
              <button 
                className={styles.ghost} 
                onClick={() => { 
                  setViewMode("idle");
                  setCreatedDoc(null); 
                  setCreatedDocMeta(null); 
                }}
              >
                Назад
              </button>
              <button 
                className={styles.primary} 
                onClick={onContinueConnect} 
                disabled={connectMutation.isPending}
              >
                {connectMutation.isPending ? "Подключение..." : "Подключить и продолжить"}
              </button>
            </div>
          </div>
        )}

        {viewMode === "task" && taskId && (
          <div className={styles.taskBlock}>
            <h4>Процесс подключения — задача {taskId}</h4>
            <div className={styles.eventsList}>
              {wsEvents.map((ev, idx) => {
                const journalId = ev?.payload?.journal_id ?? ev?.payload?.journalId ?? ev?.payload?.journal;
                const message = ev.type === "event" 
                  ? (ev.payload?.message ?? JSON.stringify(ev.payload)) 
                  : (ev.message ?? ev.raw ?? JSON.stringify(ev));
                return (
                  <div key={idx} className={styles.eventItem}>
                    <div className={styles.eventText}>
                      <strong>{ev.type}</strong>: {message}
                    </div>
                    {journalId && (
                      <button 
                        className={styles.btnSmall} 
                        onClick={() => downloadJournal(journalId)}
                      >
                        Журнал
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {viewMode === "error" && processingError && (
          <div className={styles.errorBlock}>
            <h4>Ошибка</h4>
            <p className={styles.processingError}>{processingError.message}</p>
            {processingError.details && (
              <pre className={styles.details}>
                {JSON.stringify(processingError.details, null, 2)}
              </pre>
            )}
            <div className={styles.errorBtns}>
              {processingError.journalId && (
                <button
                  className={styles.btnDownload}
                  onClick={() => downloadJournal(processingError.journalId)}
                >
                  Скачать журнал
                </button>
              )}
              <button 
                className={styles.btnSecondary} 
                onClick={() => {
                  setViewMode("idle");
                  setProcessingError(null);
                }}
              >
                Попробовать снова
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}