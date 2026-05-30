import express from "express";
import {
  createItinerary,
  getItinerary,
  listItineraries
} from "../controllers/itineraryController.js";
import { protect } from "../middleware/auth.js";
import { uploadDocuments } from "../middleware/upload.js";

const router = express.Router();

router.use(protect);
router.post("/generate", uploadDocuments.array("documents", 5), createItinerary);
router.get("/", listItineraries);
router.get("/:id", getItinerary);

export default router;
