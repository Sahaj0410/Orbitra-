import express from "express";
import { getSharedItinerary } from "../controllers/shareController.js";

const router = express.Router();

router.get("/:shareId", getSharedItinerary);

export default router;
