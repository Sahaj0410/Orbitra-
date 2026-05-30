import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { api, setAuthToken, setUnauthorizedHandler } from "../utils/api.js";

const AuthContext = createContext(null);

function loadStoredSession() {
  try {
    const token = localStorage.getItem("orbitra_token");
    const userValue = localStorage.getItem("orbitra_user");
    const user = userValue ? JSON.parse(userValue) : null;

    if (token) {
      const payload = parseJwt(token);
      if (payload?.exp && payload.exp * 1000 <= Date.now()) {
        localStorage.removeItem("orbitra_user");
        localStorage.removeItem("orbitra_token");
        setAuthToken(null);
        return { token: null, user: null };
      }
    }

    if (token) {
      setAuthToken(token);
    }

    return { token, user };
  } catch {
    localStorage.removeItem("orbitra_user");
    localStorage.removeItem("orbitra_token");
    setAuthToken(null);
    return { token: null, user: null };
  }
}

const storedSession = loadStoredSession();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(storedSession.token);
  const [user, setUser] = useState(storedSession.user);
  const logoutTimerRef = useRef(null);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout();
    });

    return () => {
      setUnauthorizedHandler(null);
    };
  }, []);

  function persistSession(payload) {
    localStorage.setItem("orbitra_token", payload.token);
    localStorage.setItem("orbitra_user", JSON.stringify(payload.user));
    setAuthToken(payload.token);
    setToken(payload.token);
    setUser(payload.user);
  }

  async function login(values) {
    const { data } = await api.post("/auth/login", values, {
      headers: {
        "x-auth-flow": "login"
      }
    });
    persistSession(data);
  }

  async function register(values) {
    const { data } = await api.post("/auth/register", values, {
      headers: {
        "x-auth-flow": "register"
      }
    });
    persistSession(data);
  }

  function logout() {
    if (logoutTimerRef.current) {
      window.clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
    localStorage.removeItem("orbitra_token");
    localStorage.removeItem("orbitra_user");
    setAuthToken(null);
    setToken(null);
    setUser(null);
  }

  useEffect(() => {
    if (logoutTimerRef.current) {
      window.clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }

    if (!token) {
      return;
    }

    const payload = parseJwt(token);
    if (!payload?.exp) {
      return;
    }

    const expiresInMs = payload.exp * 1000 - Date.now();
    if (expiresInMs <= 0) {
      logout();
      return;
    }

    logoutTimerRef.current = window.setTimeout(() => {
      logout();
    }, expiresInMs);
  }, [token]);

  const value = useMemo(
    () => ({ token, user, login, register, logout }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function parseJwt(token) {
  try {
    const payload = token.split(".")[1];
    if (!payload) {
      return null;
    }

    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export function useAuth() {
  return useContext(AuthContext);
}
