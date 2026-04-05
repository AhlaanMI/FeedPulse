import { GoogleGenAI } from "@google/genai";

interface GeminiAnalysisResult {
  category: "Bug" | "Feature Request" | "Improvement" | "Other";
  sentiment: "Positive" | "Neutral" | "Negative";
  priority_score: number;
  summary: string;
  tags: string[];
}

const getClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }

  return new GoogleGenAI({ apiKey, apiVersion: "v1" });
};

const DEFAULT_MODELS_TO_TRY = [
  process.env.GEMINI_MODEL,
  "gemini-2.0-flash",
  "gemini-2.0-flash-001",
  "models/gemini-2.0-flash",
].filter(Boolean) as string[];

async function generateWithFallback(
  ai: GoogleGenAI,
  contents: string,
): Promise<string> {
  let lastError: unknown;

  for (const model of DEFAULT_MODELS_TO_TRY) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
      });

      return response.text?.trim() || "";
    } catch (error: any) {
      lastError = error;
      const status = error?.status;
      const message: string | undefined = error?.message;

      // If the model isn't found/supported, try the next known-good model ID.
      if (status === 404 || message?.includes("not found")) {
        continue;
      }

      throw error;
    }
  }

  throw lastError;
}

export async function analyzeWithGemini(
  title: string,
  description: string,
): Promise<GeminiAnalysisResult | null> {
  try {
    const ai = getClient();
    if (!ai) {
      console.warn("GEMINI_API_KEY not set");
      return null;
    }

    const prompt = `Analyse this product feedback and return ONLY valid JSON:

Title: ${title}
Description: ${description}

Return JSON:
{
  "category": "Bug" | "Feature Request" | "Improvement" | "Other",
  "sentiment": "Positive" | "Neutral" | "Negative",
  "priority_score": number (1-10),
  "summary": "Brief summary",
  "tags": ["tag1", "tag2"]
}`;

    let text = await generateWithFallback(ai, prompt);

    // Remove markdown if exists
    text = text.replace(/```json|```/g, "").trim();

    const data = JSON.parse(text);

    return {
      category: data.category,
      sentiment: data.sentiment,
      priority_score: Math.max(1, Math.min(10, data.priority_score)),
      summary: data.summary,
      tags: (data.tags || []).slice(0, 5),
    };
  } catch (error) {
    console.error("Gemini analyze error:", error);
    return null;
  }
}

export async function generateSummary(
  feedbackItems: any[],
): Promise<string | null> {
  try {
    const ai = getClient();
    if (!ai || feedbackItems.length === 0) {
      return null;
    }

    const feedbackSummary = feedbackItems
      .map((item, i) => `${i + 1}. ${item.ai_summary || item.title}`)
      .join("\n");

    const prompt = `Analyze these feedback items and give top 3 insights:

${feedbackSummary}

Return short bullet points.`;

    const text = await generateWithFallback(ai, prompt);
    return text || null;
  } catch (error) {
    console.error("Gemini summary error:", error);
    return null;
  }
}

