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
    const imagePayload = await generateItineraryImages({
      destination: aiPayload.destination,
      days: aiPayload.days
    });

    const itinerary = await Itinerary.create({
      user: req.user._id,
      ...aiPayload,
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
