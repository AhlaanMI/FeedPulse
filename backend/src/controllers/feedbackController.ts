import { Request, Response } from "express";
import { Feedback } from "../models/Feedback";
import { analyzeWithGemini, generateSummary } from "../services/gemini.service";
import { v4 as uuidv4 } from "uuid";

// Utility to get client IP
function getClientIp(req: Request): string {
  return (
    (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
    (req.socket.remoteAddress as string) ||
    ""
  );
}

// Rate limit store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimitStore.get(ip);

  if (!limit || now > limit.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + 3600000 }); // 1 hour
    return true;
  }

  if (limit.count >= 5) {
    return false;
  }

  limit.count++;
  return true;
}

export const submitFeedback = async (req: Request, res: Response) => {
  try {
    const { title, description, category, submitterName, submitterEmail } =
      req.body;

    // Validate inputs
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        data: null,
        error: "VALIDATION_ERROR",
        message: "Title and description are required",
      });
    }

    if (title.length < 5) {
      return res.status(400).json({
        success: false,
        data: null,
        error: "VALIDATION_ERROR",
        message: "Title must be at least 5 characters",
      });
    }

    if (description.length < 20) {
      return res.status(400).json({
        success: false,
        data: null,
        error: "VALIDATION_ERROR",
        message: "Description must be at least 20 characters",
      });
    }

    // Check rate limit
    const clientIp = getClientIp(req);
    if (!checkRateLimit(clientIp)) {
      return res.status(429).json({
        success: false,
        data: null,
        error: "RATE_LIMIT_EXCEEDED",
        message: "Too many submissions from this IP. Maximum 5 per hour.",
      });
    }

    // Create feedback document
    const feedback = new Feedback({
      title: title.trim(),
      description: description.trim(),
      category: category || "Other",
      submitterName: submitterName?.trim() || null,
      submitterEmail: submitterEmail?.trim() || null,
      submitterIp: clientIp,
    });

    await feedback.save();

    // Trigger AI analysis asynchronously
    analyzeWithGemini(feedback.title, feedback.description)
      .then(async (analysis) => {
        if (analysis) {
          feedback.ai_category = analysis.category;
          feedback.ai_sentiment = analysis.sentiment;
          feedback.ai_priority = analysis.priority_score;
          feedback.ai_summary = analysis.summary;
          feedback.ai_tags = analysis.tags;
          feedback.ai_processed = true;
          await feedback.save();
        }
      })
      .catch((err) => console.error("Background AI analysis failed:", err));

    res.status(201).json({
      success: true,
      data: feedback,
      error: null,
      message: "Feedback submitted successfully",
    });
  } catch (error: any) {
    console.error("Error submitting feedback:", error);
    res.status(500).json({
      success: false,
      data: null,
      error: "INTERNAL_SERVER_ERROR",
      message: error.message || "Failed to submit feedback",
    });
  }
};

export const getAllFeedback = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const category = req.query.category as string;
    const status = req.query.status as string;
    const sort = req.query.sort as string;
    const search = req.query.search as string;

    const skip = (page - 1) * limit;
    const query: any = {};

    if (category) query.category = category;
    if (status) query.status = status;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { ai_summary: { $regex: search, $options: "i" } },
      ];
    }

    let sortOption: any = { createdAt: -1 }; // Default sort by newest
    if (sort === "priority") sortOption = { ai_priority: -1 };
    if (sort === "sentiment") sortOption = { ai_sentiment: 1 };

    const total = await Feedback.countDocuments(query);
    const feedback = await Feedback.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: {
        feedback,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      error: null,
      message: "Feedback retrieved successfully",
    });
  } catch (error: any) {
    console.error("Error retrieving feedback:", error);
    res.status(500).json({
      success: false,
      data: null,
      error: "INTERNAL_SERVER_ERROR",
      message: error.message || "Failed to retrieve feedback",
    });
  }
};

export const getFeedbackById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const feedback = await Feedback.findById(id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        data: null,
        error: "NOT_FOUND",
        message: "Feedback not found",
      });
    }

    res.status(200).json({
      success: true,
      data: feedback,
      error: null,
      message: "Feedback retrieved successfully",
    });
  } catch (error: any) {
    console.error("Error retrieving feedback:", error);
    res.status(500).json({
      success: false,
      data: null,
      error: "INTERNAL_SERVER_ERROR",
      message: error.message || "Failed to retrieve feedback",
    });
  }
};

export const updateFeedbackStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["New", "In Review", "Resolved"].includes(status)) {
      return res.status(400).json({
        success: false,
        data: null,
        error: "VALIDATION_ERROR",
        message: "Valid status required: New, In Review, or Resolved",
      });
    }

    const feedback = await Feedback.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true },
    );

    if (!feedback) {
      return res.status(404).json({
        success: false,
        data: null,
        error: "NOT_FOUND",
        message: "Feedback not found",
      });
    }

    res.status(200).json({
      success: true,
      data: feedback,
      error: null,
      message: "Feedback status updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating feedback:", error);
    res.status(500).json({
      success: false,
      data: null,
      error: "INTERNAL_SERVER_ERROR",
      message: error.message || "Failed to update feedback",
    });
  }
};

export const deleteFeedback = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const feedback = await Feedback.findByIdAndDelete(id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        data: null,
        error: "NOT_FOUND",
        message: "Feedback not found",
      });
    }

    res.status(200).json({
      success: true,
      data: null,
      error: null,
      message: "Feedback deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting feedback:", error);
    res.status(500).json({
      success: false,
      data: null,
      error: "INTERNAL_SERVER_ERROR",
      message: error.message || "Failed to delete feedback",
    });
  }
};

export const generateFeedbackSummary = async (req: Request, res: Response) => {
  try {
    // Get feedback from last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const feedback = await Feedback.find({
      createdAt: { $gte: sevenDaysAgo },
      ai_processed: true,
    }).sort({ ai_priority: -1 });

    if (feedback.length === 0) {
      return res.status(200).json({
        success: true,
        data: { summary: "No feedback from the last 7 days" },
        error: null,
        message: "Summary generated successfully",
      });
    }

    const summary = await generateSummary(feedback);

    res.status(200).json({
      success: true,
      data: { summary: summary || "Unable to generate summary" },
      error: null,
      message: "Summary generated successfully",
    });
  } catch (error: any) {
    console.error("Error generating summary:", error);
    res.status(500).json({
      success: false,
      data: null,
      error: "INTERNAL_SERVER_ERROR",
      message: error.message || "Failed to generate summary",
    });
  }
};

export const getStatsbar = async (req: Request, res: Response) => {
  try {
    const total = await Feedback.countDocuments();
    const openItems = await Feedback.countDocuments({ status: "New" });

    const allFeedback = await Feedback.find();
    const avgPriority =
      allFeedback.length > 0
        ? (
            allFeedback.reduce((sum, f) => sum + (f.ai_priority || 0), 0) /
            allFeedback.length
          ).toFixed(2)
        : 0;

    // Most common tag
    const tagCounts = new Map<string, number>();
    allFeedback.forEach((f) => {
      f.ai_tags?.forEach((tag) => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });
    const mostCommonTag =
      Array.from(tagCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ||
      "N/A";

    res.status(200).json({
      success: true,
      data: {
        totalFeedback: total,
        openItems,
        averagePriority: avgPriority,
        mostCommonTag,
      },
      error: null,
      message: "Stats retrieved successfully",
    });
  } catch (error: any) {
    console.error("Error getting stats:", error);
    res.status(500).json({
      success: false,
      data: null,
      error: "INTERNAL_SERVER_ERROR",
      message: error.message || "Failed to get stats",
    });
  }
};
