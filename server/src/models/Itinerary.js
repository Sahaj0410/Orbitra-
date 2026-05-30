import mongoose from "mongoose";

const uploadedDocumentSchema = new mongoose.Schema(
  {
    originalName: String,
    mimeType: String,
    size: Number,
    path: String,
    extractedTextPreview: String
  },
  { _id: false }
);

const itinerarySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true
    },
    destination: {
      type: String,
      default: "Upcoming trip"
    },
    startDate: String,
    endDate: String,
    summary: String,
    heroImageUrl: String,
    days: [
      {
        date: String,
        title: String,
        morning: String,
        afternoon: String,
        evening: String,
        logistics: String
      }
    ],
    bookings: [
      {
        type: { type: String },  // ← fixed: prevents Mongoose from misreading "type" as a schema keyword
        provider: String,
        confirmation: String,
        date: String,
        time: String,
        location: String,
        notes: String
      }
    ],
    tips: [String],
    dayImages: [String],
    documents: [uploadedDocumentSchema],
    shareId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    isPublic: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Itinerary", itinerarySchema);