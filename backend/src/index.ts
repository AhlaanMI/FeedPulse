import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import feedbackRoutes from "./routes/feedbackRoutes";
import authRoutes from "./routes/authRoutes";
import { User } from "./models/User";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/feedpulse";

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected successfully");

    // Initialize admin user if it doesn't exist
    const adminEmail = "admin@feedpulse.com";
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const adminUser = new User({
        email: adminEmail,
        password: "admin123456", // Change this in production!
        role: "admin",
      });
      await adminUser.save();
      console.log("Admin user created:", adminEmail);
    }
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};

// Routes
app.use("/api/feedback", feedbackRoutes);
app.use("/api/auth", authRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "FeedPulse backend is running" });
});

// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error("Error:", err);
    res.status(500).json({
      success: false,
      data: null,
      error: "INTERNAL_SERVER_ERROR",
      message: err.message || "Internal server error",
    });
  },
);

// Start server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});

export default app;
