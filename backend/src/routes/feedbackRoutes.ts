import { Router } from "express";
import {
  submitFeedback,
  getAllFeedback,
  getFeedbackById,
  updateFeedbackStatus,
  deleteFeedback,
  generateFeedbackSummary,
  getStatsbar,
} from "../controllers/feedbackController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// Public routes
router.post("/", submitFeedback);

// Named routes BEFORE dynamic :id routes
router.get("/stats", getStatsbar);
router.get("/summary/generate", authenticateToken, generateFeedbackSummary);

// Protected dynamic routes
router.patch("/:id", authenticateToken, updateFeedbackStatus);
router.delete("/:id", authenticateToken, deleteFeedback);

// Generic routes (lowest priority)
router.get("/", getAllFeedback);
router.get("/:id", getFeedbackById);

export default router;
