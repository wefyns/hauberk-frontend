import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { secretService } from "../../services/secretService";
import styles from "../Home.module.css";

function SecretsPage() {
  const { orgId } = useParams();
  const [showAddForm, setShowAddForm] = useState(false);
  const [addSecretSuccess, setAddSecretSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      secret_mark: "",
      secret_value: "",
      secret_type: "AGENT_PASSWORD",
    },
  });

  const {
    data: secrets,
    isLoading: loading,
    error,
    refetch: refetchSecrets,
  } = useQuery({
    queryKey: ["secrets", orgId],
    queryFn: () => secretService.getSecrets(parseInt(orgId)),
    enabled: !!orgId,
    select: (data) => data?.secrets || [],
  });

  const onSubmit = async (data) => {
    try {
      setAddSecretSuccess(false);

      await secretService.addSecret(parseInt(orgId), data);

      setAddSecretSuccess(true);
      reset();

      // Refetch secrets to update the list
      refetchSecrets();

      // Close the form after successful addition
      setTimeout(() => {
        setShowAddForm(false);
        setAddSecretSuccess(false);
      }, 300);
    } catch (err) {
      return { error: err.message || "Failed to add secret" };
    }
  };

  return (
    <div className={styles.sectionContent}>
      <div className={styles.sectionHeader}>
        <h2>Secrets</h2>
        <button
          className={styles.addButton}
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? "Cancel" : "+ Add Secret"}
        </button>
      </div>

      {showAddForm && (
        <div className={styles.addForm}>
          <h3>Add New Secret</h3>
          {addSecretSuccess && (
            <p className={styles.success}>Secret added successfully!</p>
          )}
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className={styles.formGroup}>
              <label htmlFor="secret_mark">Secret Mark *</label>
              <input
                type="text"
                id="secret_mark"
                className={styles.input}
                {...register("secret_mark", {
                  required: "Secret mark is required",
                })}
              />
              {errors.secret_mark && (
                <span className={styles.error}>
                  {errors.secret_mark.message}
                </span>
              )}
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="secret_value">Secret Value *</label>
              <input
                type="password"
                id="secret_value"
                className={styles.input}
                {...register("secret_value", {
                  required: "Secret value is required",
                })}
              />
              {errors.secret_value && (
                <span className={styles.error}>
                  {errors.secret_value.message}
                </span>
              )}
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="secret_type">Secret Type *</label>
              <textarea
                id="secret_type"
                className={styles.input}
                rows="3"
                {...register("secret_type", {
                  required: "Secret type is required",
                })}
              />
              {errors.secret_type && (
                <span className={styles.error}>
                  {errors.secret_type.message}
                </span>
              )}
            </div>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adding..." : "Add Secret"}
            </button>
          </form>
        </div>
      )}

      {loading && <p>Loading secrets...</p>}
      {error && <p className={styles.error}>Error: {error?.message || "Failed to fetch secrets"}</p>}

      {!loading && !error && (
        <div className={styles.secretsList}>
          {secrets.length === 0 ? (
            <p>No secrets found for this organization.</p>
          ) : (
            (Array.isArray(secrets) ? secrets : []).map((secret) => (
              <div key={secret.id} className={styles.secretCard}>
                <h3>{secret.secret_mark}</h3>
                <p className={styles.secretDescription}>{secret.secret_type}</p>
                <p className={styles.secretId}>ID: {secret.id}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default SecretsPage;
