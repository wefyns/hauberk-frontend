import Cookies from "js-cookie";
import { createContext, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Pages } from "../constants/routes";
import { authService, userService } from "../services";
import { useQuery, useQueryClient } from "@tanstack/react-query";

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
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const refreshTimeoutRef = useRef(null);

  const [currentToken, setCurrentToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const scheduleRefresh = (accessToken) => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }

    const payload = authService.parseJwt(accessToken);
    if (!payload?.exp) return;

    const now = Math.floor(Date.now() / 1000);
    const secondsLeft = payload.exp - now;
    const REFRESH_MARGIN = 60;

    const msUntil = Math.max((secondsLeft - REFRESH_MARGIN) * 1000, 5 * 1000);

    refreshTimeoutRef.current = setTimeout(async () => {
      try {
        const newTokens = await authService._refreshIfNeeded();
        if (newTokens?.access_token) {
          setCurrentToken(newTokens?.access_token);
          queryClient.invalidateQueries({ queryKey: ["currentUser"] });
        } else {
          logoutFromApp();
        }
      } catch (err) {
        console.error("Auto-refresh failed:", err);
        logoutFromApp();
      }
    }, msUntil)
  } 

  useEffect(() => {
    const { access_token } = authService.getTokens();
    if (access_token) {
      setCurrentToken(access_token);
      scheduleRefresh(access_token);
    }
    setLoading(false);

    return () => {
      if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { data: currentUser, refetch: refetchCurrentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => userService.whoami(),
    enabled: !!currentToken,
    retry: false,
    onError: () => {
      authService._refreshIfNeeded()
        .then((newTokens) => {
          if (newTokens?.access_token) {
            setCurrentToken(newTokens?.access_token);
            scheduleRefresh(newTokens?.access_token);
            refetchCurrentUser();
          } else {
            logoutFromApp();
          }
        })
        .catch(() => {
          logoutFromApp();
        });
    },
  });

  // Login function
  const loginToApp = (authData) => {
    setCurrentToken(authData);
    authService.setTokens(authData);
  };

  // Logout function
  const logoutFromApp = (redirectTo = Pages.Login) => {
    setCurrentToken(null);
    authService.removeTokens();
    queryClient.clear();
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
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
