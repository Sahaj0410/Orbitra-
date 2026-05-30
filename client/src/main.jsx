import React from "react";
import ReactDOM from "react-dom/client";
import { Navigate, RouterProvider, createBrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider, useAuth } from "./state/AuthContext.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import BlogPage from "./pages/BlogPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import GeneratePage from "./pages/GeneratePage.jsx";
import HomePage from "./pages/HomePage.jsx";
import ItineraryPage from "./pages/ItineraryPage.jsx";
import SharedPage from "./pages/SharedPage.jsx";
import "./styles.css";

function ProtectedRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/auth" replace />;
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "auth", element: <AuthPage /> },
      { path: "blog", element: <BlogPage /> },
      { path: "contact", element: <ContactPage /> },
      {
        path: "dashboard",
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        )
      },
      {
        path: "generate",
        element: (
          <ProtectedRoute>
            <GeneratePage />
          </ProtectedRoute>
        )
      },
      {
        path: "itineraries/:id",
        element: (
          <ProtectedRoute>
            <ItineraryPage />
          </ProtectedRoute>
        )
      },
      { path: "share/:shareId", element: <SharedPage /> }
    ]
  }
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);
