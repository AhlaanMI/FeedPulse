import { GoogleGenerativeAI } from "@google/generative-ai";

interface GeminiAnalysisResult {
  category: "Bug" | "Feature Request" | "Improvement" | "Other";
  sentiment: "Positive" | "Neutral" | "Negative";
  priority_score: number;
  summary: string;
  tags: string[];
}

const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function analyzeWithGemini(
  title: string,
  description: string,
): Promise<GeminiAnalysisResult | null> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY not set, skipping AI analysis");
      return null;
    }

    const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Analyse this product feedback and return ONLY valid JSON with no markdown formatting, no code blocks, just the raw JSON object. The feedback is:

Title: ${title}
Description: ${description}

Return ONLY a JSON object with these fields:
{
  "category": "Bug" | "Feature Request" | "Improvement" | "Other",
  "sentiment": "Positive" | "Neutral" | "Negative",
  "priority_score": number between 1 and 10,
  "summary": "Brief summary of the feedback",
  "tags": ["tag1", "tag2", "tag3"]
}

Respond with ONLY the JSON object, no additional text.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Parse the JSON response - try to extract JSON if wrapped in markdown
    let jsonStr = text.trim();

    // Remove markdown code blocks if present
    if (jsonStr.includes("```json")) {
      jsonStr = jsonStr.replace(/```json\n?|\n?```/g, "");
    } else if (jsonStr.includes("```")) {
      jsonStr = jsonStr.replace(/```\n?|\n?```/g, "");
    }

    const analysis = JSON.parse(jsonStr.trim());

    // Validate the response structure
    if (
      !analysis.category ||
      !analysis.sentiment ||
      typeof analysis.priority_score !== "number" ||
      !analysis.summary ||
      !Array.isArray(analysis.tags)
    ) {
      console.error("Invalid Gemini response structure:", analysis);
      return null;
    }

    // Ensure priority_score is between 1-10
    const priority = Math.max(
      1,
      Math.min(10, Math.round(analysis.priority_score)),
    );

    return {
      category: analysis.category,
      sentiment: analysis.sentiment,
      priority_score: priority,
      summary: analysis.summary,
      tags: analysis.tags.slice(0, 5), // Limit to 5 tags
    };
  } catch (error) {
    console.error("Error analyzing feedback with Gemini:", error);
    return null;
  }
}

export async function generateSummary(
  feedbackItems: any[],
): Promise<string | null> {
  try {
    if (!process.env.GEMINI_API_KEY || feedbackItems.length === 0) {
      return null;
    }

    const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });

    const feedbackSummary = feedbackItems
      .map((item, i) => `${i + 1}. ${item.ai_summary || item.title}`)
      .join("\n");

    const prompt = `Based on these product feedback items from the last 7 days, identify the top 3 themes or patterns and provide insights:

${feedbackSummary}

Provide a concise summary of the top 3 themes in bullet points.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Error generating summary with Gemini:", error);
    return null;
  }
}
