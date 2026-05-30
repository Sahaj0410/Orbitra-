import Itinerary from "../models/Itinerary.js";
import { createHttpError } from "../utils/createHttpError.js";

export async function getSharedItinerary(req, res, next) {
  try {
    const itinerary = await Itinerary.findOne({
      shareId: req.params.shareId,
      isPublic: true
    }).select("-user -documents.path");

    if (!itinerary) {
      throw createHttpError(404, "Shared itinerary not found");
    }

    res.json({ itinerary });
  } catch (error) {
    next(error);
  }
}
