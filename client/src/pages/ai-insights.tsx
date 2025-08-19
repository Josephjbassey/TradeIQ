import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, TrendingUp, AlertTriangle, Target } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AIInsights() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: analyses = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/analyses"],
  });

  const generatePortfolioAnalysisMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/analyses/portfolio"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/analyses"] });
      toast({
        title: "Analysis Complete",
        description: "New portfolio analysis has been generated!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const { data: tips = [], isLoading: tipsLoading } = useQuery<any[]>({
    queryKey: ["/api/tips?level=beginner"],
  });

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="AI Insights" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gray-300 rounded"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-48 bg-gray-300 rounded-xl"></div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title="AI Insights" subtitle="Get intelligent analysis of your trading performance" />
      <main className="flex-1 overflow-y-auto p-6">
        {/* Actions */}
        <Card className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2" data-testid="actions-title">
                Generate New Analysis
              </h3>
              <p className="text-sm text-gray-600">
                Run AI analysis on your current portfolio and trading patterns
              </p>
            </div>
            <Button
              onClick={() => generatePortfolioAnalysisMutation.mutate()}
              disabled={generatePortfolioAnalysisMutation.isPending}
              className="bg-primary text-white hover:bg-blue-700"
              data-testid="button-generate-analysis"
            >
              <Lightbulb className="w-4 h-4 mr-2" />
              {generatePortfolioAnalysisMutation.isPending ? "Analyzing..." : "Analyze Portfolio"}
            </Button>
          </div>
        </Card>

        {/* AI Analyses */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {analyses.length === 0 ? (
            <div className="lg:col-span-2">
              <Card className="bg-white rounded-xl shadow-sm p-12 border border-gray-100">
                <div className="text-center">
                  <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2" data-testid="no-analyses-title">
                    No AI Analyses Yet
                  </h3>
                  <p className="text-gray-500 mb-6" data-testid="no-analyses-message">
                    Add some trades and generate your first AI analysis to get personalized insights and recommendations.
                  </p>
                  <Button
                    onClick={() => generatePortfolioAnalysisMutation.mutate()}
                    disabled={generatePortfolioAnalysisMutation.isPending}
                    className="bg-primary text-white hover:bg-blue-700"
                    data-testid="button-get-started"
                  >
                    Get Started
                  </Button>
                </div>
              </Card>
            </div>
          ) : (
            analyses.map((analysis: any, index: number) => (
              <Card key={analysis.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <Lightbulb className="w-5 h-5 text-primary mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900" data-testid={`analysis-title-${index}`}>
                      {analysis.analysisType === 'portfolio_analysis' ? 'Portfolio Analysis' : 'Trade Review'}
                    </h3>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className="text-xs"
                    data-testid={`analysis-confidence-${index}`}
                  >
                    {Math.round(Number(analysis.confidence) * 100)}% Confidence
                  </Badge>
                </div>

                <div className="space-y-4">
                  {analysis.analysisType === 'portfolio_analysis' && analysis.insights ? (
                    <>
                      {analysis.insights.overallPerformance && (
                        <div className="bg-blue-50 border-l-4 border-primary p-4 rounded">
                          <div className="flex items-start">
                            <TrendingUp className="w-5 h-5 text-primary mr-2 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-gray-900 mb-1">Overall Performance</h4>
                              <p className="text-sm text-gray-600" data-testid={`analysis-performance-${index}`}>
                                {analysis.insights.overallPerformance}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {analysis.insights.riskAlerts && analysis.insights.riskAlerts.length > 0 && (
                        <div className="bg-yellow-50 border-l-4 border-warning p-4 rounded">
                          <div className="flex items-start">
                            <AlertTriangle className="w-5 h-5 text-warning mr-2 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-gray-900 mb-1">Risk Alerts</h4>
                              <ul className="text-sm text-gray-600 space-y-1" data-testid={`analysis-risks-${index}`}>
                                {analysis.insights.riskAlerts.map((alert: string, alertIndex: number) => (
                                  <li key={alertIndex}>• {alert}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}

                      {analysis.insights.improvementAreas && analysis.insights.improvementAreas.length > 0 && (
                        <div className="bg-green-50 border-l-4 border-success p-4 rounded">
                          <div className="flex items-start">
                            <Target className="w-5 h-5 text-success mr-2 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-gray-900 mb-1">Improvement Areas</h4>
                              <ul className="text-sm text-gray-600 space-y-1" data-testid={`analysis-improvements-${index}`}>
                                {analysis.insights.improvementAreas.map((area: string, areaIndex: number) => (
                                  <li key={areaIndex}>• {area}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="bg-gray-50 p-4 rounded">
                      <p className="text-sm text-gray-600" data-testid={`analysis-recommendations-${index}`}>
                        {analysis.recommendations || 'Detailed analysis insights available.'}
                      </p>
                    </div>
                  )}

                  <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
                    Generated on {new Date(analysis.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Trading Tips */}
        <Card className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4" data-testid="tips-title">
            AI Trading Tips for Beginners
          </h3>
          
          {tipsLoading ? (
            <div className="animate-pulse space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-4 bg-gray-300 rounded"></div>
              ))}
            </div>
          ) : tips && tips.length > 0 ? (
            <div className="space-y-3" data-testid="tips-list">
              {tips.map((tip: string, index: number) => (
                <div 
                  key={index} 
                  className="flex items-start bg-gray-50 p-3 rounded-lg"
                  data-testid={`tip-${index}`}
                >
                  <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5">
                    {index + 1}
                  </div>
                  <p className="text-sm text-gray-700">{tip}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500" data-testid="no-tips-message">
                Trading tips are currently unavailable. Please try again later.
              </p>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
