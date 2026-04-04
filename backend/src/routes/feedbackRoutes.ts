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

// Protected routes (require admin authentication)
router.get("/", getAllFeedback);
router.get("/stats", getStatsbar);
router.get("/:id", getFeedbackById);
router.patch("/:id", authenticateToken, updateFeedbackStatus);
router.delete("/:id", authenticateToken, deleteFeedback);
router.get("/summary/generate", authenticateToken, generateFeedbackSummary);

export default router;
