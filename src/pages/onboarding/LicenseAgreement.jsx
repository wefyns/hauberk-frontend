import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { userService } from "../../services/userService";
import { useAuthContext } from "../../contexts/useAuth";
import { Pages } from "../../constants/routes";
import styles from "./LicenseAgreement.module.css";

function LicenseAgreement() {
  const navigate = useNavigate();
  const { logoutFromApp } = useAuthContext();
  const [pdfUrl, setPdfUrl] = useState(null);
  const [renderError, setRenderError] = useState(false);

  // Cleanup function for object URLs
  useEffect(() => {
    return () => {
      if (pdfUrl && pdfUrl.startsWith("blob:")) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  // Fetch license agreement
  const { isLoading, error } = useQuery({
    queryKey: ["licenseAgreement"],
    queryFn: async () => {
      try {
        // Try to get response as arrayBuffer to ensure binary integrity
        const response = await userService.getLicenseAgreement();

        // Create a Blob from the arrayBuffer with the correct MIME type
        const blob = new Blob([response], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);

        return response;
      } catch (err) {
        console.error("Error in PDF processing:", err);
        throw err;
      }
    },
  });

  const acceptMutation = useMutation({
    mutationFn: () => userService.acceptLicenseAgreement(),
    onSuccess: () => {
      navigate(Pages.SetEmailPassword);
    },
    onError: (error) => {
      console.error("Error accepting license agreement:", error);
    },
  });

  // Handler for accept button
  const handleAccept = () => {
    acceptMutation.mutate();
  };

  // Handler for decline button
  const handleDecline = () => {
    logoutFromApp();
  };

  // Handle iframe errors
  const handlePdfError = () => {
    console.error("Failed to render PDF");
    setRenderError(true);
  };

  return (
    <div className={styles.licenseContainer}>
      <div className={styles.licenseContent}>
        <h1>Лицензионное соглашение</h1>

        {isLoading && (
          <p className={styles.loading}>Загрузка лицензионного соглашения...</p>
        )}

        {(error || renderError) && (
          <div className={styles.error}>
            <p>Не удалось загрузить лицензионное соглашение. Пожалуйста, попробуйте снова.</p>
            <button onClick={() => window.location.reload()}>Перезагрузить</button>
            <p className={styles.errorDetails}>
              {error && `Error: ${error.message || "Unknown error"}`}
            </p>
          </div>
        )}

        <div className={styles.pdfContainer}>
          <iframe
            src={pdfUrl}
            title="License Agreement"
            className={styles.pdfViewer}
            onError={handlePdfError}
            onLoad={() => console.log("PDF iframe loaded successfully")}
          />
        </div>

        <div className={styles.actionButtons}>
          <button
            className={`${styles.actionButton} ${styles.declineButton}`}
            onClick={handleDecline}
            disabled={isLoading || !pdfUrl || renderError}
          >
            Отказаться
          </button>
          <button
            className={`${styles.actionButton} ${styles.acceptButton}`}
            onClick={handleAccept}
            disabled={
              isLoading || !pdfUrl || renderError || acceptMutation.isPending
            }
          >
            {acceptMutation.isPending ? "Обработка..." : "Принять"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default LicenseAgreement;
