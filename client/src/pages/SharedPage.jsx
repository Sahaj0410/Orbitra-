import React from "react";
import { Plane } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ItineraryView from "../components/ItineraryView.jsx";
import { api, getErrorMessage } from "../utils/api.js";

export default function SharedPage() {
  const { shareId } = useParams();
  const [itinerary, setItinerary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/share/${shareId}`)
      .then(({ data }) => setItinerary(data.itinerary))
      .catch((err) => setError(getErrorMessage(err)));
  }, [shareId]);

  return (
    <section className="shared-page">
      <Link to="/auth" className="shared-brand">
        <Plane size={20} />
        Orbitra AI
      </Link>
      {error && <p className="error-text">{error}</p>}
      {!error && !itinerary && <p className="muted">Loading shared itinerary...</p>}
      {itinerary && <ItineraryView itinerary={itinerary} publicView />}
    </section>
  );
}
