import { v4 as uuid } from "uuid";
import Itinerary from "../models/Itinerary.js";
import { extractTextFromFile } from "../services/extractionService.js";
import { generateItinerary } from "../services/itineraryAiService.js";
import { generateItineraryImages } from "../services/imageService.js";
import { createHttpError } from "../utils/createHttpError.js";

export async function createItinerary(req, res, next) {
  try {
    const files = req.files || [];

    if (!files.length) {
      throw createHttpError(400, "Upload at least one travel document");
    }

    const extractedParts = await Promise.all(files.map(extractTextFromFile));
    const extractedText = extractedParts.join("\n\n");
    const aiPayload = await generateItinerary({
      extractedText,
      notes: req.body.notes
    });
    const safePayload = sanitizeItineraryPayload(aiPayload);
    const imagePayload = await generateItineraryImages({
      destination: safePayload.destination,
      days: safePayload.days
    });

    const itinerary = await Itinerary.create({
      user: req.user._id,
      ...safePayload,
      heroImageUrl: imagePayload.heroImageUrl,
      dayImages: imagePayload.dayImages,
      documents: files.map((file, index) => ({
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        path: file.path,
        extractedTextPreview: extractedParts[index]?.slice(0, 500) || ""
      })),
      shareId: uuid()
    });

    res.status(201).json({ itinerary });
  } catch (error) {
    next(error);
  }
}

function sanitizeItineraryPayload(payload) {
  return {
    title: stringify(payload.title) || "AI Travel Itinerary",
    destination: stringify(payload.destination) || "Upcoming trip",
    startDate: stringify(payload.startDate),
    endDate: stringify(payload.endDate),
    summary: stringify(payload.summary),
    days: Array.isArray(payload.days)
      ? payload.days
          .filter((day) => day && typeof day === "object")
          .map((day, index) => ({
            date: stringify(day.date) || `Day ${index + 1}`,
            title: stringify(day.title) || `Day ${index + 1}`,
            morning: stringify(day.morning),
            afternoon: stringify(day.afternoon),
            evening: stringify(day.evening),
            logistics: stringify(day.logistics)
          }))
      : [],
    bookings: Array.isArray(payload.bookings)
      ? payload.bookings
          .filter((booking) => booking && typeof booking === "object" && !Array.isArray(booking))
          .map((booking) => ({
            type: stringify(booking.type),
            provider: stringify(booking.provider),
            confirmation: stringify(booking.confirmation),
            date: stringify(booking.date),
            time: stringify(booking.time),
            location: stringify(booking.location),
            notes: stringify(booking.notes)
          }))
          .filter((booking) => Object.values(booking).some(Boolean))
      : [],
    tips: Array.isArray(payload.tips) ? payload.tips.map(stringify).filter(Boolean) : []
  };
}

function stringify(value) {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return "";
}

export async function listItineraries(req, res, next) {
  try {
    const itineraries = await Itinerary.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .select("title destination startDate endDate summary shareId createdAt heroImageUrl");

    res.json({ itineraries });
  } catch (error) {
    next(error);
  }
}

export async function getItinerary(req, res, next) {
  try {
    const itinerary = await Itinerary.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!itinerary) {
      throw createHttpError(404, "Itinerary not found");
    }

    res.json({ itinerary });
  } catch (error) {
    next(error);
  }
}
