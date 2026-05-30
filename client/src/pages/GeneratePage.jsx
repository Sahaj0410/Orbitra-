import React from "react";
import { BadgeCheck, FileText, Loader2, Sparkles, UploadCloud, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, getErrorMessage } from "../utils/api.js";

export default function GeneratePage() {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [notes, setNotes] = useState("");
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const totalSize = useMemo(
    () => files.reduce((sum, file) => sum + file.size, 0),
    [files]
  );

  function addFiles(fileList) {
    const incoming = Array.from(fileList);
    setFiles((current) => [...current, ...incoming].slice(0, 5));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!files.length) {
      setError("Upload at least one booking document.");
      return;
    }

    const formData = new FormData();
    files.forEach((file) => formData.append("documents", file));
    formData.append("notes", notes);

    setLoading(true);
    try {
      const { data } = await api.post("/itineraries/generate", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      navigate(`/itineraries/${data.itinerary._id}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="page narrow">
      <div className="page-heading">
        <div>
          <p className="eyebrow">AI itinerary generator</p>
          <h1>Upload booking documents</h1>
          <p className="heading-copy">Drop confirmations, add preferences, and let the planner build a clean day-wise trip.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="generator-panel">
        <div className="generator-steps">
          <span><BadgeCheck size={16} /> Upload</span>
          <span><BadgeCheck size={16} /> Extract</span>
          <span><BadgeCheck size={16} /> Generate</span>
          <span><BadgeCheck size={16} /> Share</span>
        </div>
        <label
          className={`dropzone ${dragging ? "dragging" : ""}`}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            addFiles(event.dataTransfer.files);
          }}
        >
          <UploadCloud size={40} />
          <strong>Drop PDFs or images here</strong>
          <span>Flight tickets, hotel vouchers, train tickets, or travel confirmations</span>
          <input
            type="file"
            accept=".pdf,image/png,image/jpeg,image/webp"
            multiple
            onChange={(event) => addFiles(event.target.files)}
          />
        </label>

        {files.length > 0 && (
          <div className="file-list">
            {files.map((file, index) => (
              <div className="file-row" key={`${file.name}-${index}`}>
                <FileText size={18} />
                <span>{file.name}</span>
                <small>{Math.round(file.size / 1024)} KB</small>
                <button type="button" onClick={() => setFiles(files.filter((_, itemIndex) => itemIndex !== index))}>
                  <X size={16} />
                </button>
              </div>
            ))}
            <p className="muted">Total upload size: {(totalSize / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        )}

        <label className="notes-field">
          <span>Trip notes</span>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Example: vegetarian food, prefer relaxed mornings, business meeting on day 2..."
          />
        </label>

        {error && <p className="error-text">{error}</p>}

        <button className="submit-button" disabled={loading}>
          {loading ? <Loader2 className="spin" size={18} /> : <Sparkles size={18} />}
          {loading ? "Generating itinerary..." : "Generate itinerary"}
        </button>
      </form>
    </section>
  );
}
