import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { agentService } from "../../services/agentService";
import { secretService } from "../../services/secretService";
import styles from "../Home.module.css";

function AgentsPage() {
  const { orgId } = useParams();
  const [showAddForm, setShowAddForm] = useState(false);
  const [addAgentSuccess, setAddAgentSuccess] = useState(false);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      uuid: "",
      secret_id: "",
      protocol: "https",
      host: "",
      port: 8443
    }
  });

  // Use useQuery for agents data
  const { 
    data: agentsData, 
    isLoading: agentsLoading, 
    error: agentsError,
    refetch: refetchAgents 
  } = useQuery({
    queryKey: ['agents', orgId],
    queryFn: () => agentService.getAgents(parseInt(orgId)),
    enabled: !!orgId,
    select: (data) => data?.agents || []
  });

  // Use useQuery for secrets data
  const { 
    data: secrets, 
    isLoading: secretsLoading 
  } = useQuery({
    queryKey: ['secrets', orgId],
    queryFn: () => secretService.getSecrets(parseInt(orgId)),
    enabled: !!orgId,
    select: (data) => data?.secrets || []
  });

  const onSubmit = async (data) => {
    try {
      setAddAgentSuccess(false);
      
      // Convert string values to number where needed
      const formattedData = {
        ...data,
        port: parseInt(data.port),
        secret_id: parseInt(data.secret_id)
      };
      
      await agentService.addAgent(parseInt(orgId), formattedData);
      
      setAddAgentSuccess(true);
      reset();
      
      // Refetch agents to update the list
      refetchAgents();
      
      // Close the form after successful addition
      setTimeout(() => {
        setShowAddForm(false);
        setAddAgentSuccess(false);
      }, 1000);
      
    } catch (err) {
      return { error: err.message || "Failed to add agent" };
    }
  };

  return (
    <div className={styles.sectionContent}>
      <div className={styles.sectionHeader}>
        <h2>Agents</h2>
        <button 
          className={styles.addButton}
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? "Cancel" : "+ Add Agent"}
        </button>
      </div>
      
      {showAddForm && (
        <div className={styles.addForm}>
          <h3>Add New Agent</h3>
          {addAgentSuccess && (
            <p className={styles.success}>Agent added successfully!</p>
          )}
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className={styles.formGroup}>
              <label htmlFor="uuid">Agent UUID *</label>
              <input
                type="text"
                id="uuid"
                placeholder="e.g., agent-123e4567-e89b-12d3-a456-426614174000"
                {...register("uuid", {
                  required: "Agent UUID is required"
                })}
                className={styles.input}
              />
              {errors.uuid && <span className={styles.error}>{errors.uuid.message}</span>}
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="secret_id">Secret *</label>
              <select
                id="secret_id"
                disabled={secretsLoading || secrets?.length === 0}
                {...register("secret_id", {
                  required: "Secret is required"
                })}
                className={styles.input}
              >
                <option value="">Select a secret</option>
                {secrets?.map(secret => (
                  <option key={secret.id} value={secret.id}>
                    {secret.name} (ID: {secret.id} - {secret.secret_mark} - {secret.secret_type})
                  </option>
                ))}
              </select>
              {errors.secret_id && <span className={styles.error}>{errors.secret_id.message}</span>}
              {secrets?.length === 0 && !secretsLoading && (
                <p className={styles.formHelp}>
                  No secrets available. Please add a secret first.
                </p>
              )}
              {secretsLoading && <p className={styles.formHelp}>Loading secrets...</p>}
            </div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="protocol">Protocol</label>
                <select
                  id="protocol"
                  {...register("protocol")}
                  className={styles.input}
                >
                  <option value="https">HTTPS</option>
                  <option value="http">HTTP</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="host">Host *</label>
                <input
                  type="text"
                  id="host"
                  placeholder="e.g., example.com or 192.168.1.1"
                  {...register("host", {
                    required: "Host is required"
                  })}
                  className={styles.input}
                />
                {errors.host && <span className={styles.error}>{errors.host.message}</span>}
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="port">Port *</label>
                <input
                  type="number"
                  id="port"
                  placeholder="e.g., 8443"
                  min="1"
                  max="65535"
                  {...register("port", {
                    required: "Port is required",
                    min: {
                      value: 1,
                      message: "Port must be at least 1"
                    },
                    max: {
                      value: 65535,
                      message: "Port must be at most 65535"
                    }
                  })}
                  className={styles.input}
                />
                {errors.port && <span className={styles.error}>{errors.port.message}</span>}
              </div>
            </div>
            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={isSubmitting || secrets?.length === 0}
            >
              {isSubmitting ? "Adding..." : "Add Agent"}
            </button>
          </form>
        </div>
      )}
      
      {agentsLoading && <p>Loading agents...</p>}
      {agentsError && <p className={styles.error}>Error: {agentsError.message || "Failed to fetch agents"}</p>}
      {!agentsLoading && !agentsError && (
        <div className={styles.agentsList}>
          {agentsData?.length === 0 ? (
            <p>No agents found for this organization.</p>
          ) : (
            agentsData?.map((agent) => (
              <div key={agent.id} className={styles.agentCard}>
                <h3>{agent.uuid}</h3>
                <p>
                  Host: {agent.host}:{agent.port}
                </p>
                <p>Protocol: {agent.protocol}</p>
                <p>Secret ID: {agent.secret_id}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default AgentsPage;
