import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "your-api-key-here"
});

export interface TradeAnalysisInput {
  symbol: string;
  side: "buy" | "sell";
  quantity: number;
  entryPrice: number;
  exitPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  strategy?: string;
  notes?: string;
  pnl?: number;
}

export interface TradeAnalysisResult {
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  riskAssessment: string;
  patternRecognition: string;
  overallScore: number;
  confidence: number;
}

export interface PortfolioAnalysisInput {
  totalPnl: number;
  winRate: number;
  totalTrades: number;
  avgProfit: number;
  recentTrades: TradeAnalysisInput[];
}

export interface PortfolioAnalysisResult {
  overallPerformance: string;
  keyInsights: string[];
  riskAlerts: string[];
  improvementAreas: string[];
  tradingPatterns: string[];
  confidence: number;
}

export async function analyzeIndividualTrade(trade: TradeAnalysisInput): Promise<TradeAnalysisResult> {
  try {
    const prompt = `
Analyze this trading performance data and provide detailed insights:

Trade Details:
- Symbol: ${trade.symbol}
- Side: ${trade.side}
- Quantity: ${trade.quantity}
- Entry Price: $${trade.entryPrice}
${trade.exitPrice ? `- Exit Price: $${trade.exitPrice}` : ''}
${trade.stopLoss ? `- Stop Loss: $${trade.stopLoss}` : ''}
${trade.takeProfit ? `- Take Profit: $${trade.takeProfit}` : ''}
${trade.strategy ? `- Strategy: ${trade.strategy}` : ''}
${trade.notes ? `- Notes: ${trade.notes}` : ''}
${trade.pnl ? `- P&L: $${trade.pnl}` : ''}

Please provide a comprehensive analysis in JSON format with the following structure:
{
  "strengths": ["list of strengths in this trade"],
  "weaknesses": ["list of weaknesses or areas for improvement"],
  "recommendations": ["specific actionable recommendations"],
  "riskAssessment": "assessment of risk management in this trade",
  "patternRecognition": "identification of trading patterns or setups",
  "overallScore": number between 1-100,
  "confidence": number between 0-1
}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert trading coach and analyst. Provide detailed, actionable insights for beginner traders to help them improve their performance."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return {
      strengths: result.strengths || [],
      weaknesses: result.weaknesses || [],
      recommendations: result.recommendations || [],
      riskAssessment: result.riskAssessment || "",
      patternRecognition: result.patternRecognition || "",
      overallScore: Math.max(1, Math.min(100, result.overallScore || 50)),
      confidence: Math.max(0, Math.min(1, result.confidence || 0.5)),
    };
  } catch (error) {
    throw new Error(`Failed to analyze trade: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function analyzePortfolio(portfolio: PortfolioAnalysisInput): Promise<PortfolioAnalysisResult> {
  try {
    const prompt = `
Analyze this trading portfolio performance and provide comprehensive insights:

Portfolio Metrics:
- Total P&L: $${portfolio.totalPnl}
- Win Rate: ${portfolio.winRate}%
- Total Trades: ${portfolio.totalTrades}
- Average Profit: $${portfolio.avgProfit}

Recent Trades (last 5):
${portfolio.recentTrades.map((trade, idx) => `
${idx + 1}. ${trade.symbol} ${trade.side.toUpperCase()} ${trade.quantity} @ $${trade.entryPrice}
   ${trade.exitPrice ? `Exit: $${trade.exitPrice}` : 'Still Open'}
   ${trade.pnl ? `P&L: $${trade.pnl}` : ''}
   ${trade.strategy ? `Strategy: ${trade.strategy}` : ''}
`).join('')}

Please provide a comprehensive portfolio analysis in JSON format:
{
  "overallPerformance": "summary of overall performance",
  "keyInsights": ["list of key insights about trading patterns"],
  "riskAlerts": ["list of risk-related alerts or concerns"],
  "improvementAreas": ["specific areas for improvement"],
  "tradingPatterns": ["identified patterns in trading behavior"],
  "confidence": number between 0-1
}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert trading mentor specializing in helping beginner traders improve their performance through data-driven insights."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return {
      overallPerformance: result.overallPerformance || "",
      keyInsights: result.keyInsights || [],
      riskAlerts: result.riskAlerts || [],
      improvementAreas: result.improvementAreas || [],
      tradingPatterns: result.tradingPatterns || [],
      confidence: Math.max(0, Math.min(1, result.confidence || 0.5)),
    };
  } catch (error) {
    throw new Error(`Failed to analyze portfolio: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function generateTradingTips(userLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner'): Promise<string[]> {
  try {
    const prompt = `
Generate 5 specific, actionable trading tips for ${userLevel} traders. 
Focus on practical advice that can be immediately implemented.
Return the tips as a JSON array of strings.

Format: ["tip 1", "tip 2", "tip 3", "tip 4", "tip 5"]
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a professional trading educator with expertise in helping traders at all levels improve their skills."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || '[]');
    return Array.isArray(result) ? result : result.tips || [];
  } catch (error) {
    throw new Error(`Failed to generate trading tips: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
