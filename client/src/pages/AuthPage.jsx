import React from "react";
import { ArrowRight, CheckCircle2, LockKeyhole, Mail, Sparkles, User } from "lucide-react";
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext.jsx";
import { getErrorMessage } from "../utils/api.js";

export default function AuthPage() {
  const { token, login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [values, setValues] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const cardCopy =
    mode === "login"
      ? {
          title: "Welcome back",
          description: "Sign in to continue building AI-crafted travel plans."
        }
      : {
          title: "Create your account",
          description: "Start turning booking confirmations into shareable itineraries."
        };

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (mode === "login") {
        await login({ email: values.email, password: values.password });
      } else {
        await register(values);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-layout">
      <div className="auth-copy auth-hero">
        <div className="hero-float-card standalone">
          <Sparkles size={18} />
          <span>AI itinerary ready in seconds</span>
        </div>
        <p className="eyebrow">AI travel planner</p>
        <h1>Turn booking documents into a ready-to-share itinerary.</h1>
        <p>
          Upload tickets, hotel confirmations, and trip notes. Orbitra AI extracts the important
          details and creates a structured travel plan for the whole journey.
        </p>
        <div className="feature-strip">
          <span><CheckCircle2 size={16} /> Smart parsing</span>
          <span><CheckCircle2 size={16} /> Day-wise planning</span>
          <span><CheckCircle2 size={16} /> Trip-ready summary</span>
        </div>
      </div>
      <form className="auth-card auth-form" onSubmit={handleSubmit}>
        <div className="auth-card-header">
          <h2>{cardCopy.title}</h2>
          <p>{cardCopy.description}</p>
        </div>
        <div className="tabs">
          <button type="button" className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>
            Login
          </button>
          <button type="button" className={mode === "register" ? "active" : ""} onClick={() => setMode("register")}>
            Register
          </button>
        </div>

        {mode === "register" && (
          <label className="field">
            <span>Name</span>
            <div>
              <User size={18} />
              <input
                value={values.name}
                onChange={(event) => setValues({ ...values, name: event.target.value })}
                placeholder="Sahaj Sharma"
                required
              />
            </div>
          </label>
        )}

        <label className="field">
          <span>Email</span>
          <div>
            <Mail size={18} />
            <input
              type="email"
              value={values.email}
              onChange={(event) => setValues({ ...values, email: event.target.value })}
              placeholder="you@example.com"
              required
            />
          </div>
        </label>

        <label className="field">
          <span>Password</span>
          <div>
            <LockKeyhole size={18} />
            <input
              type="password"
              value={values.password}
              onChange={(event) => setValues({ ...values, password: event.target.value })}
              placeholder="Minimum 6 characters"
              minLength={6}
              required
            />
          </div>
        </label>

        {error && <p className="error-text">{error}</p>}

        <button className="submit-button" disabled={loading}>
          {loading ? "Please wait..." : mode === "login" ? "Login" : "Create account"}
          <ArrowRight size={18} />
        </button>
      </form>
    </section>
  );
}
