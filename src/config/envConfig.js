export function getEnvConfig() {
  try {
    if (window.env) {
      console.log("Current enviroment", window.env);
      return window.env;
    }
  } catch (error) {
    console.error("Failed to parse env:", error);
  }

  return {
    apiUrl: "",
  };
}
