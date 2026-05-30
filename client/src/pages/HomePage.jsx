import React from "react";
import { Compass, Sparkles, Timer, Wand2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <section className="page">
      <div className="home-hero">
        <div>
          <p className="eyebrow">Travel planning, reimagined</p>
          <h1>Design itinerary stories from your bookings.</h1>
          <p className="heading-copy">
            Orbitra AI transforms travel confirmations into a polished, share-ready journey plan
            with visual highlights, day-by-day pacing, and smart trip context.
          </p>
          <div className="hero-actions">
            <Link to="/generate" className="primary-action">
              Start a new itinerary
            </Link>
            <Link to="/dashboard" className="secondary-button">
              View your trips
            </Link>
          </div>
        </div>
        <div className="hero-panel">
          <div className="panel-card">
            <span className="panel-label">LATEST ITINERARY</span>
            <h3>Coastal Escape</h3>
            <p>4 days of curated stops, relaxed mornings, and local taste trails.</p>
            <div className="panel-meta">
              <span>Hand-off ready</span>
              <span>Shared to 2 travelers</span>
            </div>
          </div>
          <div className="panel-card alt">
            <span className="panel-label">NEXT UP</span>
            <h3>Tokyo Tempo</h3>
            <p>Balance skyline icons with slow evenings and food-led districts.</p>
          </div>
        </div>
      </div>

      <div className="home-grid">
        <div className="surface-card">
          <Sparkles size={20} />
          <div>
            <h3>AI crafted itinerary flow</h3>
            <p>Day-by-day structure with pacing that matches your bookings.</p>
          </div>
        </div>
        <div className="surface-card">
          <Wand2 size={20} />
          <div>
            <h3>Beautiful visual delivery</h3>
            <p>Every itinerary receives a destination-inspired visual system.</p>
          </div>
        </div>
        <div className="surface-card">
          <Timer size={20} />
          <div>
            <h3>Fast travel prep</h3>
            <p>Upload documents and get a ready plan within minutes.</p>
          </div>
        </div>
        <div className="surface-card">
          <Compass size={20} />
          <div>
            <h3>Smart suggestions</h3>
            <p>Insights from notes to keep the trip aligned with your intent.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
