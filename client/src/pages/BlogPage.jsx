import React from "react";

const posts = [
  {
    title: "Designing smoother arrival days",
    tag: "Planning",
    body: [
      "Arrival day sets the emotional tone for the whole trip. Resist the temptation to pack it with activities, even if the flight lands early.",
      "Start with a soft landing: hotel check-in, a short walk, and a low-stakes neighborhood meal. It gives everyone space to recalibrate after transit.",
      "If a must-see exists, schedule it late afternoon. You will still get the highlight without burning the entire day.",
      "Use a simple rule: one anchor moment + one optional idea. Everything else becomes optional, not required.",
      "Finally, keep transit details visible. The best arrival day is the one where you never have to dig for confirmations."
    ]
  },
  {
    title: "How to share trips without chaos",
    tag: "Collaboration",
    body: [
      "Shared travel plans collapse when everyone runs their own version. The fix is a single, reference itinerary that becomes the source of truth.",
      "Assign a light role for each traveler: logistics, dining, and transport. It lowers decision fatigue and spreads responsibility.",
      "Keep the plan readable. If a day needs a scroll, split it into sessions so everyone can scan quickly on mobile.",
      "Highlight two kinds of items: fixed bookings and flexible ideas. That makes it clear what is locked and what is negotiable.",
      "When someone joins late, share the link once and let the plan explain itself. Avoid re-sending screenshots."
    ]
  },
  {
    title: "Using AI notes the right way",
    tag: "AI Tips",
    body: [
      "The best AI outputs come from constraints. Instead of generic wishes, note the specifics that change pacing and choices.",
      "Good examples: vegetarian only, two museum visits max, or no late nights before a meeting.",
      "Add location anchors as well: a neighborhood you must visit or a landmark you want framed in the schedule.",
      "Be clear about energy levels. A relaxed morning can shift the entire day forward and avoid burnout.",
      "Finally, include the purpose of the trip. Business, celebration, or recovery each calls for a different rhythm."
    ]
  },
  {
    title: "What makes a premium itinerary",
    tag: "Experience",
    body: [
      "Premium itineraries are calm. They give the traveler clarity and a sense of confidence without looking busy.",
      "Every day has a narrative arc: a strong start, a focused middle, and a gentle evening wind-down.",
      "Spacing is the hidden luxury. Buffer time between activities protects the trip from delays and keeps energy stable.",
      "Visual hierarchy matters too. Titles, timing, and logistics should stand apart so the plan reads in seconds.",
      "Above all, the plan should feel intentional. If something does not serve the trip goal, it does not belong."
    ]
  }
];

export default function BlogPage() {
  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Orbitra journal</p>
          <h1>Planning notes from the lounge</h1>
          <p className="heading-copy">Insights on itinerary design, sharing, and travel pacing.</p>
        </div>
      </div>

      <div className="blog-grid">
        {posts.map((post) => (
          <article className="blog-card" key={post.title}>
            <span className="blog-tag">{post.tag}</span>
            <h3>{post.title}</h3>
            <div className="blog-body">
              {post.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
