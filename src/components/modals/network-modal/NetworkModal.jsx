import React, { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog } from "../../dialog/Dialog";
import { agentService } from "../../../services";
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
  const [wsEvents, setWsEvents] = useState([]);
  const [blobUrl, setBlobUrl] = useState(null);

  const createDocMutation = useMutation({
    mutationFn: ({file}) => {
      return agentService.createConnectionDocument(orgId, agentId, file);
    },
    onSuccess: (res) => {
      const doc = res?.document ?? res ?? null;
      setCreatedDoc(doc);
      setCreatedDocMeta({
        document_id: res?.document_id ?? null,
        journal_id: res?.journal_id ?? null,
      });
      setProcessingError(null);
    },
    onError: (err) => {
      console.error("createConnectionDocument error:", err);
      const payload = err?.response?.data ?? null;
      const details = payload?.details ?? null;
      const journalId = payload?.journal_id ?? null;
      setProcessingError({
        message: err?.message || "Error when processing the configuration file",
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
        setWsEvents((prev) => [...prev, { type: "info", message: `Task started: ${t}` }]);
      } else {
        console.warn("connect response (no task id):", res);
        setProcessingError({ message: "The connection is started, but the task_id has not been received.", details: res });
      }
    },
    onError: (err) => {
      console.error("connectWithDocument error:", err);
      setProcessingError({ message: err?.message || "Error when starting the connection", details: err?.response?.data ?? err?.data });
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
      setFileError("The file could not be read.");
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
      setFileError("Select the configuration file (.json).");
      return;
    }
    createDocMutation.mutate({ file: selectedFile });
  };

  const onContinueConnect = () => {
    const docId = createdDocMeta?.document_id ?? createdDoc?.id ?? createdDocMeta?.id;
    if (!docId) {
      setProcessingError({ message: "There is no document ID to continue." });
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
    setWsEvents([]);
  }

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
          <label className={styles.label}>Configuration file</label>
          <div className={styles.fileArea}>
            <textarea
              readOnly
              className={styles.preview}
              value={filePreview || (selectedFile ? selectedFile.name : "")}
              placeholder="Choose.a json file"
            />
            <div className={styles.fileControls}>
              <button className={styles.btn} onClick={onClickPicker}>…</button>
              {/* <button className={styles.btnSecondary} onClick={onClearFile}>Clear</button> */}
            </div>
          </div>
          {fileError && <div className={styles.error}>{fileError}</div>}
        </div>

        <div className={styles.actionsRow}>
          <button className={styles.ghost} onClick={() => { cleanup(); onClose("custom"); }}>Cancel</button>
          <button className={styles.primary} onClick={onUploadDocument} disabled={createDocMutation.isLoading}>
            {createDocMutation.isLoading ? "Processing..." : "Create a document"}
          </button>
        </div>

        {processingError && (
          <div className={styles.errorBlock}>
            <h4>Error</h4>
            <p>{processingError.message}</p>
            {processingError.details && <pre className={styles.details}>{JSON.stringify(processingError.details, null, 2)}</pre>}
            <div className={styles.errorBtns}>
              {processingError.journalId && (
                <button className={styles.btn} onClick={() => {}}>Download the magazine</button>
              )}
              <button className={styles.btnSecondary} onClick={() => setProcessingError(null)}>Ok</button>
            </div>
          </div>
        )}

        {createdDoc && (
          <div className={styles.resultBlock}>
            <h4>The created document</h4>
            <pre className={styles.docPreview}>{JSON.stringify(createdDoc, null, 2)}</pre>
            <div className={styles.resultBtns}>
              <button className={styles.primary} onClick={onContinueConnect} disabled={connectMutation.isLoading}>
                {connectMutation.isLoading ? "Connect..." : "Continue and connect"}
              </button>
              <button className={styles.ghost} onClick={() => { setCreatedDoc(null); setCreatedDocMeta(null); }}>Close</button>
            </div>
          </div>
        )}

        {taskId && (
          <div className={styles.taskBlock}>
            <h4>The connect process — task {taskId}</h4>
            <div className={styles.eventsList}>
              {wsEvents.map((ev, idx) => {
                const journalId = ev?.payload?.journal_id ?? ev?.payload?.journalId ?? ev?.payload?.journal;
                const message = ev.type === "event" ? (ev.payload.message ?? JSON.stringify(ev.payload)) : (ev.message ?? ev.raw ?? JSON.stringify(ev));
                return (
                  <div key={idx} className={styles.eventItem}>
                    <div className={styles.eventText}><strong>{ev.type}</strong>: {message}</div>
                    {journalId && <button className={styles.btn} onClick={() => {}}>Journal</button>}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
}