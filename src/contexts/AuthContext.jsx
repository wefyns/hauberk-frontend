import Cookies from "js-cookie";
import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pages } from "../constants/routes";
import { authService, userService } from "../services";
import { useQuery } from "@tanstack/react-query";

// Cookie name for storing auth state
const AUTH_COOKIE_NAME = "auth_user";
// Cookie options - adjust as needed
const COOKIE_OPTIONS = {
  expires: 7, // Cookie expiration in days
  path: "/",
  sameSite: "strict",
  // secure: true // Enable in HTTPS environments
};

// Create the auth context
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentToken, setCurrentToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => userService.whoami(),
    enabled: !!currentToken,
    retry: false,
    onError: () => {
      logoutFromApp();
    },
  });

  // Check for existing auth cookie on mount
  useEffect(() => {
    const savedToken = authService.getTokens().access_token;

    if (savedToken) {
      try {
        setCurrentToken(savedToken);
      } catch (error) {
        console.error("Failed to parse auth cookie:", error);
        Cookies.remove(AUTH_COOKIE_NAME);
      }
    }

    setLoading(false);
  }, []);

  // Login function
  const loginToApp = (authData) => {
    setCurrentToken(authData);
    authService.setTokens(authData);
  };

  // Logout function
  const logoutFromApp = (redirectTo = Pages.Login) => {
    setCurrentToken(null);
    authService.removeTokens();
    navigate(redirectTo);
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!currentToken;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentToken,
        loginToApp,
        logoutFromApp,
        isAuthenticated,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Export the context for custom hook
export { AuthContext };
