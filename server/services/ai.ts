import { analyzeIndividualTrade as openaiAnalyzeTrade, analyzePortfolio as openaiAnalyzePortfolio, generateTradingTips as openaiGenerateTips, TradeAnalysisInput, TradeAnalysisResult, PortfolioAnalysisInput, PortfolioAnalysisResult } from "./openai";
// Dynamic import to avoid hard dependency when using OpenAI provider
async function getGemini() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mod: any = await import("@google/generative-ai").catch(() => null);
  if (!mod) throw new Error("@google/generative-ai not installed");
  return new mod.GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
}

const provider = (process.env.AI_PROVIDER || "openai").toLowerCase();

async function geminiJson(prompt: string): Promise<any> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set");
  const genAI = await getGemini();
  const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || "gemini-1.5-pro" });
  const result = await model.generateContent(prompt);
  const text = result?.response?.text?.() || "{}";
  try { return JSON.parse(text); } catch { return { text }; }
}

export async function analyzeIndividualTrade(input: TradeAnalysisInput): Promise<TradeAnalysisResult> {
  if (provider === "gemini") {
    const prompt = `Analyze the following trade and return JSON with keys: strengths[], weaknesses[], recommendations[], riskAssessment, patternRecognition, overallScore (1-100), confidence (0-1). Trade: ${JSON.stringify(input)}`;
    const result = await geminiJson(prompt);
    return {
      strengths: result.strengths || [],
      weaknesses: result.weaknesses || [],
      recommendations: result.recommendations || [],
      riskAssessment: result.riskAssessment || "",
      patternRecognition: result.patternRecognition || "",
      overallScore: Math.max(1, Math.min(100, result.overallScore || 50)),
      confidence: Math.max(0, Math.min(1, result.confidence || 0.5)),
    };
  }
  return openaiAnalyzeTrade(input);
}

export async function analyzePortfolio(input: PortfolioAnalysisInput): Promise<PortfolioAnalysisResult> {
  if (provider === "gemini") {
    const prompt = `Analyze the following portfolio and return JSON with keys: overallPerformance, keyInsights[], riskAlerts[], improvementAreas[], tradingPatterns[], confidence (0-1). Portfolio: ${JSON.stringify(input)}`;
    const result = await geminiJson(prompt);
    return {
      overallPerformance: result.overallPerformance || "",
      keyInsights: result.keyInsights || [],
      riskAlerts: result.riskAlerts || [],
      improvementAreas: result.improvementAreas || [],
      tradingPatterns: result.tradingPatterns || [],
      confidence: Math.max(0, Math.min(1, result.confidence || 0.5)),
    };
  }
  return openaiAnalyzePortfolio(input);
}

export async function generateTradingTips(level: 'beginner' | 'intermediate' | 'advanced' = 'beginner'): Promise<string[]> {
  if (provider === "gemini") {
    const prompt = `Generate 5 actionable trading tips for ${level} traders. Return a JSON array of strings.`;
    const result = await geminiJson(prompt);
    return Array.isArray(result) ? result : (result.tips || []);
  }
  return openaiGenerateTips(level);
}
