import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

export default function AIInsightsWidget() {
  const { data: insights, isLoading } = useQuery({
    queryKey: ["/api/analyses"],
    select: (data: any[]) => data.slice(0, 2), // Get latest 2 insights
  });

  if (isLoading) {
    return (
      <Card className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-300 rounded"></div>
            <div className="h-3 bg-gray-300 rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center mb-4">
        <Lightbulb className="w-5 h-5 text-primary mr-2" />
        <h3 className="text-lg font-semibold text-gray-900" data-testid="ai-insights-title">
          AI Insights
        </h3>
      </div>
      
      <div className="space-y-4">
        {!insights || insights.length === 0 ? (
          <div className="text-center py-4" data-testid="no-insights-message">
            <p className="text-gray-500 text-sm mb-4">
              No insights available yet.
            </p>
            <p className="text-gray-400 text-xs">
              Add some trades to get AI-powered analysis!
            </p>
          </div>
        ) : (
          insights.map((insight: any, index: number) => (
            <div 
              key={insight.id}
              className={`border-l-4 p-4 rounded ${
                insight.analysisType === 'portfolio' 
                  ? 'bg-blue-50 border-primary' 
                  : 'bg-yellow-50 border-warning'
              }`}
              data-testid={`insight-${index}`}
            >
              <h4 className="font-medium text-gray-900 mb-1">
                {insight.analysisType === 'portfolio' ? 'Portfolio Analysis' : 'Trade Review'}
              </h4>
              <p className="text-sm text-gray-600">
                {insight.recommendations 
                  ? insight.recommendations.split('\n')[0]
                  : 'Analysis insights available'
                }
              </p>
            </div>
          ))
        )}
        
        <Link href="/ai-insights">
          <Button 
            variant="ghost"
            className="w-full text-primary hover:text-blue-700 text-sm font-medium text-left justify-start p-0"
            data-testid="button-view-full-analysis"
          >
            View Full Analysis →
          </Button>
        </Link>
      </div>
    </Card>
  );
}
