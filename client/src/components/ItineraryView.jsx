import React from "react";
import {
  CalendarDays,
  Clipboard,
  Clock3,
  Hotel,
  MapPin,
  PlaneTakeoff,
  Route,
  Share2,
  Sparkles
} from "lucide-react";
import { useState } from "react";

export default function ItineraryView({ itinerary, publicView = false }) {
  const shareUrl = `${window.location.origin}/share/${itinerary.shareId}`;
  const [copyStatus, setCopyStatus] = useState("");
  const heroImage = itinerary.heroImageUrl;
  const dayImages = itinerary.days?.map((_, index) => itinerary.dayImages?.[index] || "") || [];

  async function copyShareLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyStatus("Link copied to clipboard");
    } catch {
      setCopyStatus("Copy failed. Please try again.");
    }

    window.clearTimeout(copyShareLink.timeoutId);
    copyShareLink.timeoutId = window.setTimeout(() => {
      setCopyStatus("");
    }, 2000);
  }

  return (
    <article className="itinerary-view">
      <header
        className={`itinerary-poster ${heroImage ? "has-image" : "missing-image"}`}
        style={heroImage ? { "--hero-image": `url(${heroImage})` } : undefined}
      >
        <div className="poster-copy">
          <div className="poster-pill">
            <Sparkles size={16} />
            {publicView ? "Shared itinerary" : "AI-generated itinerary"}
          </div>
          {!heroImage && <span className="image-missing-badge">Hero image not generated</span>}
          <h1>{itinerary.title}</h1>
          <p>{itinerary.summary}</p>
          <div className="poster-meta">
            <span><MapPin size={17} /> {itinerary.destination}</span>
            <span><CalendarDays size={17} /> {itinerary.startDate || "Flexible"} {itinerary.endDate ? `to ${itinerary.endDate}` : ""}</span>
            <span><Route size={17} /> {itinerary.days?.length || 0} day plan</span>
          </div>
        </div>

        <aside className="poster-panel">
          <span className="panel-label">Trip board</span>
          <strong>{itinerary.destination}</strong>
          <p>{itinerary.days?.[0]?.title || "Arrival plan"} → {itinerary.days?.at(-1)?.title || "Departure ready"}</p>
          {!publicView && (
            <button className="secondary-button share-action" onClick={copyShareLink}>
              <Share2 size={18} />
              Copy share link
            </button>
          )}
        </aside>
      </header>

      <section className="quick-strip">
        <div>
          <span>Destination</span>
          <strong>{itinerary.destination}</strong>
        </div>
        <div>
          <span>Schedule</span>
          <strong>{itinerary.startDate || "Flexible"}</strong>
        </div>
        <div>
          <span>Bookings</span>
          <strong>{itinerary.bookings?.length || 0} detected</strong>
        </div>
        <div>
          <span>Share status</span>
          <strong>{itinerary.isPublic === false ? "Private" : "Public link"}</strong>
        </div>
      </section>

      {!publicView && (
        <section className="share-band">
          <div>
            <span className="panel-label">Shareable itinerary</span>
            <p>Send this public link to travelers, family, or reviewers.</p>
          </div>
          <button className="share-box share-copy-box" type="button" onClick={copyShareLink}>
            <Clipboard size={18} />
            <span>{shareUrl}</span>
          </button>
        </section>
      )}

      {!publicView && copyStatus && (
        <div className="toast" role="status" aria-live="polite">
          {copyStatus}
        </div>
      )}

      {itinerary.bookings?.length > 0 && (
        <section className="content-section booking-section">
          <div className="section-heading-row">
            <div>
              <span className="panel-label">Extracted from uploads</span>
              <h2>Bookings detected</h2>
            </div>
          </div>
          <div className="booking-grid">
            {itinerary.bookings.map((booking, index) => (
              <div className="booking-card" key={`${booking.type}-${index}`}>
                <div className="booking-icon">
                  {booking.type?.toLowerCase().includes("hotel") ? <Hotel size={20} /> : <PlaneTakeoff size={20} />}
                </div>
                <div>
                  <strong>{booking.type || "Booking"}</strong>
                  <p>{booking.provider || booking.location || "Travel confirmation"}</p>
                  <small>{[booking.date, booking.time, booking.confirmation].filter(Boolean).join(" | ")}</small>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="content-section itinerary-days-section">
        <div className="section-heading-row">
          <div>
            <span className="panel-label">Visual route</span>
            <h2>Day-by-day plan</h2>
          </div>
        </div>
        <div className="timeline">
          {itinerary.days?.map((day, index) => (
            <div
              className={`day-poster-card ${dayImages[index] ? "has-image" : "missing-image"}`}
              style={dayImages[index] ? { "--day-image": `url(${dayImages[index]})` } : undefined}
              key={`${day.date}-${index}`}
            >
              <div className="day-photo">
                <div className="day-index">{index + 1}</div>
                <span><Clock3 size={15} /> {day.date}</span>
                {!dayImages[index] && <strong>Image not generated</strong>}
              </div>
              <div className="day-content">
                <h3>{day.title}</h3>
                <div className="day-grid">
                  <p><strong>Morning</strong>{day.morning}</p>
                  <p><strong>Afternoon</strong>{day.afternoon}</p>
                  <p><strong>Evening</strong>{day.evening}</p>
                  <p><strong>Logistics</strong>{day.logistics}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {itinerary.tips?.length > 0 && (
        <section className="content-section tips-section">
          <div className="section-heading-row">
            <div>
              <span className="panel-label">Smart reminders</span>
              <h2>Travel tips</h2>
            </div>
          </div>
          <div className="tips-list">
            {itinerary.tips.map((tip, index) => (
              <span key={`${tip}-${index}`}>{tip}</span>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
