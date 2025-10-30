import { useState, useEffect } from "react";


export function useOnceWizardShown(options) {
  const key = options?.storageKey ?? 'first_time_setup';
  const [firstTime, setFirstTime] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);

      if (raw) {
        setFirstTime(false);
        return;
      } 

      setFirstTime(true);
    } catch {
      setFirstTime(true);
    }
  }, [key]);

  const markAsShown = () => {
    try {
      localStorage.setItem(key, Date.now().toString());
      setFirstTime(false);
    } catch {
      // ignore
    }
  };

  return { firstTime, markAsShown };
}