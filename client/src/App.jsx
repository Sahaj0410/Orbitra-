import React from "react";
import { LogOut, Plane, Plus, Route } from "lucide-react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./state/AuthContext.jsx";

export default function App() {
  const { token, user, logout } = useAuth();
  const location = useLocation();
  const isSharePage = location.pathname.startsWith("/share/");

  return (
    <div className="app-shell">
      {!isSharePage && (
        <header className="topbar">
          <Link to="/dashboard" className="brand">
            <span className="brand-mark">
              <Plane size={20} />
            </span>
            <span>Orbitra AI</span>
          </Link>
          {token && (
            <nav className="nav-actions">
              <Link to="/dashboard" className="nav-link">
                <Route size={18} />
                Trips
              </Link>
              <Link to="/blog" className="nav-link">
                Blog
              </Link>
              <Link to="/contact" className="nav-link">
                Contact
              </Link>
              <Link to="/generate" className="primary-action">
                <Plus size={18} />
                New itinerary
              </Link>
              <button className="icon-button" onClick={logout} title={`Sign out ${user?.name || ""}`}>
                <LogOut size={18} />
              </button>
            </nav>
          )}
        </header>
      )}
      <main>
        <Outlet />
      </main>
    </div>
  );
}
