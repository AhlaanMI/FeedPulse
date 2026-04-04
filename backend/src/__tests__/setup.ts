import dotenv from "dotenv";

dotenv.config();

// Set test environment variables
process.env.MONGO_URI = "mongodb://localhost:27017/feedpulse-test";
process.env.JWT_SECRET = "test-secret-key";
process.env.GEMINI_API_KEY = "";
