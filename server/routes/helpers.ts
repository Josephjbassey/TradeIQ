import { storage } from "../storage";
import { analyzeIndividualTrade, analyzePortfolio } from "../services/ai";

// Helper: map OpenAI portfolio result to our analysis record shape expected by UI
export function mapPortfolioResultToAnalysis(result: any) {
  return {
    title: "Portfolio Performance Review",
    insights: {
      overallPerformance: result.overallPerformance || result.performance || "",
      riskAlerts: result.riskAlerts || [],
      improvementAreas: result.improvementAreas || [],
      keyInsights: result.keyInsights || [],
      tradingPatterns: result.tradingPatterns || [],
    },
    // Join improvement areas into a single recommendations string as a quick summary
    recommendations: Array.isArray(result.improvementAreas)
      ? result.improvementAreas.join("\n")
      : (result.recommendations || ""),
    // Derive a 1-10 score from confidence if available
    score: typeof result.confidence === "number" ? Math.max(1, Math.round(result.confidence * 10)) : undefined,
    categories: ["performance", "risk", "diversification"],
    metrics: {},
  };
}

// Helper: mock fallback mapped to UI
export function mockAnalysis(analysisType: "trade" | "portfolio" | "strategy") {
  if (analysisType === "portfolio") {
    return {
      title: "Portfolio Performance Review",
      insights: {
        overallPerformance: "Strong monthly performance with consistent growth",
        riskAlerts: ["Watch exposure during high volatility", "Limit position concentration >20%"],
        improvementAreas: ["Tighten stops on news-heavy days", "Add hedges during drawdowns"],
        keyInsights: ["Win rate improving", "Profit factor above 2"],
        tradingPatterns: ["Trend-following bias", "Avoids midday trades"],
      },
      recommendations: "Maintain current strategy but add defensive positions during volatility spikes.",
      score: Math.floor(Math.random() * 2) + 8,
      categories: ["performance", "risk", "diversification"],
      metrics: { sharpeRatio: 1.8, maxDrawdown: 0.12, winRate: 0.68, profitFactor: 2.1 },
    };
  }
  if (analysisType === "strategy") {
    return {
      title: "Trading Strategy Assessment",
      insights: {
        consistency: "Good consistency across regimes",
        edge: "Clear statistical edge in backtests",
        execution: "Disciplined execution with low slippage",
        adaptation: "Adapts to changing volatility",
      },
      recommendations: "Introduce volatility-based position sizing.",
      score: Math.floor(Math.random() * 2) + 8,
      categories: ["strategy", "execution", "consistency"],
      metrics: { informationRatio: 1.2 },
    };
  }
  // trade
  return {
    title: "Trade Performance Analysis",
    insights: {
      strengths: ["Good entry timing", "Proper risk management"],
      weaknesses: ["Exit could be improved", "Position size too large"],
      patternRecognition: "Bullish breakout identified",
      riskAssessment: "Risk kept within plan",
    },
    recommendations: "Reduce position size by ~20% and use tighter stops.",
    score: Math.floor(Math.random() * 3) + 7,
    categories: ["timing", "risk", "strategy"],
    metrics: { riskRewardRatio: 2.5, winProbability: 0.75 },
  };
}

// Helper: build an analysis object using OpenAI when configured, else mock
export async function buildAIAnalysis(analysisType: "trade" | "portfolio" | "strategy", data: any) {
  const useOpenAI = !!process.env.OPENAI_API_KEY;
  if (!useOpenAI) return mockAnalysis(analysisType);

  try {
    if (analysisType === "trade") {
      // Map trade to service input
      const t = data;
      const result = await analyzeIndividualTrade({
        symbol: t.symbol,
        side: (t.side as "buy" | "sell") || "buy",
        quantity: Number(t.quantity),
        entryPrice: Number(t.entryPrice),
        exitPrice: t.exitPrice ? Number(t.exitPrice) : undefined,
        stopLoss: t.stopLoss ? Number(t.stopLoss) : undefined,
        takeProfit: t.takeProfit ? Number(t.takeProfit) : undefined,
        strategy: t.strategy || undefined,
        notes: t.notes || undefined,
        pnl: t.pnl ? Number(t.pnl) : undefined,
      });
      return {
        title: "Trade Performance Analysis",
        insights: {
          strengths: result.strengths,
          weaknesses: result.weaknesses,
          riskAssessment: result.riskAssessment,
          patternRecognition: result.patternRecognition,
        },
        recommendations: Array.isArray(result.recommendations) ? result.recommendations.join("\n") : "",
        score: Math.max(1, Math.round((result.overallScore || 50) / 10)),
        categories: ["timing", "risk", "strategy"],
        metrics: { confidence: result.confidence },
      };
    }

    if (analysisType === "portfolio") {
      // data should contain { userId, accountId } or { trades, metrics }
      const { userId, accountId } = data;
      const trades = await storage.getTrades(userId, accountId);
      const metrics = await (storage as any).calculatePortfolioMetrics(userId, accountId);
      const totalTrades = trades.length;
      const totalPnl = trades.reduce((sum, tr: any) => sum + Number(tr.pnl || 0), 0);
      const winRate = metrics?.winRatePercent ? Number(metrics.winRatePercent) : (totalTrades ? (trades.filter((t: any) => Number(t.pnl || 0) > 0).length / totalTrades) * 100 : 0);
      const avgProfit = totalTrades ? totalPnl / totalTrades : 0;
      const recentTrades = trades.slice(-5).map((tr: any) => ({
        symbol: tr.symbol,
        side: (tr.side as "buy" | "sell") || "buy",
        quantity: Number(tr.quantity),
        entryPrice: Number(tr.entryPrice),
        exitPrice: tr.exitPrice ? Number(tr.exitPrice) : undefined,
        stopLoss: tr.stopLoss ? Number(tr.stopLoss) : undefined,
        takeProfit: tr.takeProfit ? Number(tr.takeProfit) : undefined,
        strategy: tr.strategy || undefined,
        notes: tr.notes || undefined,
        pnl: tr.pnl ? Number(tr.pnl) : undefined,
      }));
      const result = await analyzePortfolio({ totalPnl, winRate, totalTrades, avgProfit, recentTrades });
      return mapPortfolioResultToAnalysis(result);
    }

    // strategy -> simple mock or reuse portfolio mapping
    return mockAnalysis("strategy");
  } catch (e) {
    console.warn("OpenAI analysis failed, falling back to mock:", (e as Error).message);
    return mockAnalysis(analysisType);
  }
}
