import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api"
});

let unauthorizedHandler = null;

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const authFlow = error.config?.headers?.["x-auth-flow"];
    if (error.response?.status === 401 && !authFlow && typeof unauthorizedHandler === "function") {
      unauthorizedHandler();
    }

    return Promise.reject(error);
  }
);

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    return;
  }

  delete api.defaults.headers.common.Authorization;
}

export function getErrorMessage(error) {
  if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
    return "Unable to reach the server. Please make sure the backend is running and the API URL is correct.";
  }

  const status = error.response?.status;
  const serverMessage = error.response?.data?.message;

  if (serverMessage) {
    if (serverMessage.toLowerCase().includes("user no longer exists")) {
      return "Session expired. Please sign in again.";
    }
    return serverMessage;
  }

  if (status === 400) {
    return "Invalid request. Please check your inputs and try again.";
  }

  if (status === 401) {
    const authFlow = error.config?.headers?.["x-auth-flow"];
    if (authFlow === "login" || authFlow === "register") {
      return "Invalid credentials. Please check your email and password.";
    }
    return "Session expired. Please sign in again.";
  }

  if (status === 403) {
    return "You do not have access to perform this action.";
  }

  if (status === 404) {
    return "We could not find what you requested.";
  }

  if (status === 413) {
    return "Upload too large. Please use smaller files.";
  }

  if (status === 429) {
    return "Too many requests. Please wait a moment and try again.";
  }

  if (status >= 500) {
    return "Server error. Please try again in a moment.";
  }

  return error.message || "Something went wrong";
}
