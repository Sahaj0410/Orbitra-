import React from "react";
import { CalendarDays, ExternalLink, FileUp, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, getErrorMessage } from "../utils/api.js";

export default function DashboardPage() {
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/itineraries")
      .then(({ data }) => setItineraries(data.itineraries))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Trip history</p>
          <h1>Your generated itineraries</h1>
          <p className="heading-copy">Review previous plans, open details, and copy share links for travelers.</p>
        </div>
        <Link to="/generate" className="primary-action">
          <FileUp size={18} />
          Upload bookings
        </Link>
      </div>

      {loading && <p className="muted">Loading itineraries...</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && !itineraries.length && (
        <div className="empty-state">
          <FileUp size={36} />
          <h2>No itineraries yet</h2>
          <p>Upload travel bookings to generate your first AI-powered itinerary.</p>
          <Link to="/generate" className="submit-button compact">Create itinerary</Link>
        </div>
      )}

      <div className="itinerary-grid">
        {itineraries.map((trip) => {
          const imageUrl = trip.heroImageUrl;

          return (
            <Link
              to={`/itineraries/${trip._id}`}
              className={`trip-card ${imageUrl ? "has-image" : "missing-image"}`}
              style={imageUrl ? { "--card-image": `url(${imageUrl})` } : undefined}
              key={trip._id}
            >
              {!imageUrl && <span className="image-missing-badge">Image not generated</span>}
              <div className="trip-card-header">
                <span><MapPin size={16} /> {trip.destination}</span>
                <ExternalLink size={16} />
              </div>
              <h2>{trip.title}</h2>
              <p>{trip.summary || "Generated travel plan with booking details and trip tips."}</p>
              <div className="trip-meta">
                <CalendarDays size={16} />
                <span>{trip.startDate || "Flexible"} {trip.endDate ? `to ${trip.endDate}` : ""}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
