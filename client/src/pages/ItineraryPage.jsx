import React from "react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ItineraryView from "../components/ItineraryView.jsx";
import { api, getErrorMessage } from "../utils/api.js";

export default function ItineraryPage() {
  const { id } = useParams();
  const [itinerary, setItinerary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/itineraries/${id}`)
      .then(({ data }) => setItinerary(data.itinerary))
      .catch((err) => setError(getErrorMessage(err)));
  }, [id]);

  return (
    <section className="page">
      {error && <p className="error-text">{error}</p>}
      {!error && !itinerary && <p className="muted">Loading itinerary...</p>}
      {itinerary && <ItineraryView itinerary={itinerary} />}
    </section>
  );
}
