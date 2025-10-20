import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { organizationService } from "../../services/organizationService";
import { useOrganization } from "../../contexts/useOrganization";
import { useAuthContext } from "../../contexts/useAuth";
import { Pages } from "../../constants/routes";
import styles from "./CreateOrganization.module.css";

function CreateOrganization() {
  const navigate = useNavigate();
  const { logoutFromApp } = useAuthContext();
  const { fetchOrganizations } = useOrganization();
  
  const [error, setError] = useState(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      name: "",
      name_lat: "",
      country: "",
      country_code: "",
      region: "",
      domain: "",
      settlement: "",
      ogrn: "",
    }
  });

  const onSubmit = async (data) => {
    setError(null);

    try {
      await organizationService.createOrganization(data);
      // Refresh organizations list
      await fetchOrganizations();
      // Navigate to organizations list
      navigate(Pages.Organizations);
    } catch (err) {
      setError(err.message || "Failed to create organization");
    }
  };

  const handleCancel = () => {
    navigate(Pages.Organizations);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.logo}>Hauberk</div>
        <button onClick={logoutFromApp} className={styles.logoutButton}>
          Logout
        </button>
      </div>

      <div className={styles.content}>
        <div className={styles.formContainer}>
          <h1 className={styles.title}>Create New Organization</h1>
          <p className={styles.subtitle}>Fill in the details to create your organization</p>

          {error && (
            <div className={styles.error}>
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="name" className={styles.label}>
                  Organization Name *
                </label>
                <input
                  type="text"
                  id="name"
                  className={styles.input}
                  {...register("name", {
                    required: "Organization name is required"
                  })}
                />
                {errors.name && <span className={styles.error}>{errors.name.message}</span>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="name_lat" className={styles.label}>
                  Latinized Name *
                </label>
                <input
                  type="text"
                  id="name_lat"
                  className={styles.input}
                  {...register("name_lat", {
                    required: "Latinized name is required"
                  })}
                />
                {errors.name_lat && <span className={styles.error}>{errors.name_lat.message}</span>}
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="country" className={styles.label}>
                  Country *
                </label>
                <input
                  type="text"
                  id="country"
                  className={styles.input}
                  {...register("country", {
                    required: "Country is required"
                  })}
                />
                {errors.country && <span className={styles.error}>{errors.country.message}</span>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="country_code" className={styles.label}>
                  Country Code *
                </label>
                <input
                  type="text"
                  id="country_code"
                  placeholder="e.g., US, RU, GB"
                  className={styles.input}
                  {...register("country_code", {
                    required: "Country code is required",
                    pattern: {
                      value: /^[A-Z]{2}$/,
                      message: "Enter a valid 2-letter country code (e.g., US, RU)"
                    }
                  })}
                />
                {errors.country_code && <span className={styles.error}>{errors.country_code.message}</span>}
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="region" className={styles.label}>
                  Region *
                </label>
                <input
                  type="text"
                  id="region"
                  className={styles.input}
                  {...register("region", {
                    required: "Region is required"
                  })}
                />
                {errors.region && <span className={styles.error}>{errors.region.message}</span>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="settlement" className={styles.label}>
                  Settlement *
                </label>
                <input
                  type="text"
                  id="settlement"
                  className={styles.input}
                  {...register("settlement", {
                    required: "Settlement is required"
                  })}
                />
                {errors.settlement && <span className={styles.error}>{errors.settlement.message}</span>}
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="domain" className={styles.label}>
                  Domain *
                </label>
                <input
                  type="text"
                  id="domain"
                  placeholder="e.g., example.com"
                  className={styles.input}
                  {...register("domain", {
                    required: "Domain is required",
                    pattern: {
                      value: /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/,
                      message: "Enter a valid domain name (e.g., example.com)"
                    }
                  })}
                />
                {errors.domain && <span className={styles.error}>{errors.domain.message}</span>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="ogrn" className={styles.label}>
                  OGRN
                </label>
                <input
                  type="text"
                  id="ogrn"
                  className={styles.input}
                  {...register("ogrn")}
                />
              </div>
            </div>

            <div className={styles.buttonGroup}>
              <button
                type="button"
                onClick={handleCancel}
                className={styles.cancelButton}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={styles.submitButton}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Organization"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateOrganization;