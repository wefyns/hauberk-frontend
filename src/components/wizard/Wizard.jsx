import React, { useCallback, useState, useMemo } from "react"
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import { useOnceWizardShown } from '../../hooks/useOnceWizardShown'
import { StepAgent, StepDeploy, StepNetwork, StepOrganization, StepSecret } from "./steps";

import styles from "./Wizard.module.css";

export const Wizard = ({
  storageKey,
  onFinish,
  forceShow = false,
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { firstTime } = useOnceWizardShown({
    storageKey
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [orgId, setOrgId] = useState(null);
  const [agentId, setAgentId] = useState(null);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredSubmit, setRegisteredSubmit] = useState(null);

  const steps = useMemo(() => [
    { 
      id: "organization", 
      title: "Создание организации", 
      Component: StepOrganization 
    },
    { 
      id: "secret", 
      title: "Добавление секрета", 
      Component: StepSecret 
    },
    { 
      id: "agent", 
      title: "Создание агента", 
      Component: StepAgent 
    },
    { 
      id: "deploy", 
      title: "Развертывание", 
      Component: StepDeploy 
    },
    { 
      id: "network", 
      title: "Подключение к сети", 
      Component: StepNetwork 
    },
  ], []);

  const total = steps.length;
  const _isFirst = currentIndex === 0;
  const isLast = currentIndex === total - 1;
  const currentStep = steps[currentIndex];
  const CurrentStepComponent = currentStep.Component;

  const _handlePrev = () => {
    if (isSubmitting) return;
    
    setError(null);
    setCurrentIndex(i => Math.max(0, i - 1));
    setRegisteredSubmit(null);
  };

  const registerSubmit = useCallback((fn) => {
    setRegisteredSubmit(() => fn);
  }, []);

  const wizardNext = async () => {
    if (isSubmitting) return;
    
    if (!registeredSubmit) {
      setError("Внутренняя ошибка: шаг не готов к отправке данных.");
      return;
    }

    setError(null);
    setIsSubmitting(true);
    
    try {
      const res = await registeredSubmit();
      
      console.log(`Step ${currentStep.id} result:`, res);
      
      if (!res || !res.success) {
        console.error(`Step ${currentStep.id} failed:`, res);
        setError(res?.error || "Не удалось выполнить текущий шаг. Проверьте введенные данные.");
        return;
      }

      if (currentStep.id === "organization" && res.meta?.orgId) {
        console.log(`Setting orgId: ${res.meta.orgId}`);
        setOrgId(res.meta.orgId);
        queryClient.invalidateQueries(["organizations"]);
      }
      
      if (currentStep.id === "secret" && orgId) {
        queryClient.invalidateQueries(["secrets", orgId]);
      }
      
      if (currentStep.id === "agent" && res.meta?.agentId) {
        setAgentId(res.meta.agentId);
        if (orgId) {
          queryClient.invalidateQueries(["agents", orgId]);
        }
      }

      if (isLast) {
        if (storageKey) {
          try {
            localStorage.setItem(storageKey, Date.now().toString());
          } catch (e) {
            console.warn("Не удалось сохранить статус wizard'а в localStorage:", e);
          }
        }
        onFinish?.();
        return;
      }

      setCurrentIndex(i => Math.min(total - 1, i + 1));
      setRegisteredSubmit(null);
      
    } catch (err) {
      setError(err?.message ?? String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setIsSubmitting(false);
  };

  const handleGoHome = () => {
    navigate('/home');
  };

  if (firstTime === null) {
    return null;
  }

  if (!forceShow && firstTime === false) {
    return null;
  }

  return (
    <div className={styles.wizardContainer}>
      <div className={styles.wizardHeader}>
        <div className={styles.stepInfo}>
          <h2 className={styles.stepTitle}>{currentStep.title}</h2>
          <p className={styles.stepDescription}>{currentStep.description}</p>
        </div>
      </div>

      {error && (
        <div className={styles.errorContainer}>
          <div className={styles.errorMessage}>
            {error}
          </div>
        </div>
      )}

      <div className={styles.stepsIndicator}>
        {steps.map((step, index) => (
          <div 
            key={step.id} 
            className={`${styles.stepIndicator} ${
              index === currentIndex ? styles.current : 
              index < currentIndex ? styles.completed : styles.upcoming
            }`}
          >
            <div className={styles.stepNumber}>
              {index < currentIndex ? '✓' : index + 1}
            </div>
            <span className={styles.stepLabel}>{step.title}</span>
          </div>
        ))}
      </div>

      <div className={styles.stepContent}>
        <CurrentStepComponent
          orgId={orgId}
          agentId={agentId}
          isSubmitting={isSubmitting}
          registerSubmit={registerSubmit}
        />
      </div>

      <div className={styles.wizardNavigation}>
        {orgId && (
          <button
            onClick={handleGoHome}
            disabled={isSubmitting}
            className={`${styles.navButton} ${styles.homeButton}`}
          >
            На главную
          </button>
        )}

        {error && (
          <button
            onClick={handleRetry}
            disabled={isSubmitting}
            className={`${styles.navButton} ${styles.retryButton}`}
          >
            Попробовать снова
          </button>
        )}

        <button
          onClick={wizardNext}
          disabled={isSubmitting || !registeredSubmit}
          className={`${styles.navButton} ${styles.nextButton} ${isLast ? styles.finishButton : ''}`}
        >
          {isSubmitting ? (
            <>Выполнение...</>
          ) : isLast ? (
            "Завершить настройку"
          ) : (
            "Далее"
          )}
        </button>
      </div>
    </div>
  );
}