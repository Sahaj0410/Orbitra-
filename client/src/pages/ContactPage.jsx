import React from "react";

export default function ContactPage() {
  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Contact</p>
          <h1>Let us plan the next departure</h1>
          <p className="heading-copy">
            Tell us what you need, and the Orbitra team will help you craft the perfect itinerary flow.
          </p>
        </div>
      </div>

      <div className="contact-grid">
        <form className="contact-form">
          <label className="field">
            <span>Name</span>
            <div>
              <input placeholder="Your name" required />
            </div>
          </label>
          <label className="field">
            <span>Email</span>
            <div>
              <input type="email" placeholder="you@example.com" required />
            </div>
          </label>
          <label className="notes-field">
            <span>Message</span>
            <textarea placeholder="Share your trip details or product question..." required />
          </label>
          <button className="submit-button" type="submit">Send message</button>
        </form>
        <div className="contact-cards">
          <div className="contact-card">
            <h3>Product support</h3>
            <p>support@orbitra.ai</p>
          </div>
          <div className="contact-card">
            <h3>Partnerships</h3>
            <p>partners@orbitra.ai</p>
          </div>
          <div className="contact-card">
            <h3>Office hours</h3>
            <p>Mon-Fri, 10am-6pm IST</p>
          </div>
        </div>
      </div>
    </section>
  );
}
