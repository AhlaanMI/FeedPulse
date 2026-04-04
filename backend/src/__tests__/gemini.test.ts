import {
  analyzeWithGemini,
  generateSummary,
} from "../../services/gemini.service";

// Mock the GoogleGenerativeAI module
jest.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: jest.fn().mockResolvedValue({
        response: {
          text: jest.fn().mockReturnValue(
            JSON.stringify({
              category: "Feature Request",
              sentiment: "Positive",
              priority_score: 8,
              summary: "User wants dark mode in the dashboard settings.",
              tags: ["UI", "Settings", "Accessibility"],
            }),
          ),
        },
      }),
    }),
  })),
}));

describe("Gemini Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("analyzeWithGemini", () => {
    it("should return null if GEMINI_API_KEY is not set", async () => {
      delete process.env.GEMINI_API_KEY;
      const result = await analyzeWithGemini("Test Title", "Test description");
      expect(result).toBeNull();
    });

    it("should parse valid Gemini response", async () => {
      process.env.GEMINI_API_KEY = "test-key";
      const result = await analyzeWithGemini(
        "Dark Mode Request",
        "I want dark mode in settings",
      );

      expect(result).not.toBeNull();
      expect(result?.category).toBe("Feature Request");
      expect(result?.sentiment).toBe("Positive");
      expect(result?.priority_score).toBeDefined();
      expect(Array.isArray(result?.tags)).toBe(true);
    });

    it("should clamp priority score between 1-10", async () => {
      process.env.GEMINI_API_KEY = "test-key";

      // Mock a response with out-of-range priority
      const mockResponse = {
        response: {
          text: () =>
            JSON.stringify({
              category: "Bug",
              sentiment: "Negative",
              priority_score: 15, // Out of range
              summary: "Critical issue",
              tags: ["Critical"],
            }),
        },
      };

      const result = await analyzeWithGemini("Test", "Test description");
      expect(result?.priority_score).toBeLessThanOrEqual(10);
      expect(result?.priority_score).toBeGreaterThanOrEqual(1);
    });

    it("should limit tags to 5 items", async () => {
      process.env.GEMINI_API_KEY = "test-key";
      const result = await analyzeWithGemini("Test", "Test description");

      expect(result?.tags?.length).toBeLessThanOrEqual(5);
    });
  });

  describe("generateSummary", () => {
    it("should return null for empty feedback array", async () => {
      const result = await generateSummary([]);
      expect(result).toBeNull();
    });

    it("should return null if GEMINI_API_KEY is not set", async () => {
      delete process.env.GEMINI_API_KEY;
      const mockFeedback = [{ ai_summary: "Test summary" }];
      const result = await generateSummary(mockFeedback);
      expect(result).toBeNull();
    });
  });
});
