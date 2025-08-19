import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import MetricsCards from "@/components/dashboard/metrics-cards";
import PerformanceChart from "@/components/charts/performance-chart";
import TradeTable from "@/components/trade/trade-table";
import AIInsightsWidget from "@/components/dashboard/ai-insights-widget";
import QuickActions from "@/components/dashboard/quick-actions";
import RiskMetrics from "@/components/dashboard/risk-metrics";
import { Card } from "@/components/ui/card";
import { Trade } from "@shared/schema";

export default function Dashboard() {
  const { data: trades = [], isLoading: tradesLoading } = useQuery<Trade[]>({
    queryKey: ["/api/trades"],
  });

  const { data: portfolio, isLoading: portfolioLoading } = useQuery<any>({
    queryKey: ["/api/portfolio/current"],
  });

  // Generate mock performance data - in real app this would come from API
  const performanceData = [
    { date: "Oct 1", value: 10000 },
    { date: "Oct 8", value: 10250 },
    { date: "Oct 15", value: 9800 },
    { date: "Oct 22", value: 10500 },
    { date: "Oct 29", value: 10800 },
    { date: "Nov 5", value: 11200 },
    { date: "Nov 12", value: 10900 },
    { date: "Nov 19", value: 11400 },
    { date: "Nov 25", value: portfolio?.totalValue || 10000 },
  ];

  const recentTrades = (trades as Trade[]).slice(0, 5);

  if (tradesLoading || portfolioLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Dashboard" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-6 border border-gray-100">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-8 bg-gray-300 rounded mb-1"></div>
                  <div className="h-3 bg-gray-300 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title="Dashboard" />
      <main className="flex-1 overflow-y-auto p-6">
        <MetricsCards
          totalPnL={portfolio?.totalPnl || 0}
          winRate={portfolio?.winRate || 0}
          totalTrades={portfolio?.totalTrades || 0}
          avgProfit={portfolio?.avgProfit || 0}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <PerformanceChart data={performanceData} />
            
            <div className="mt-6">
              <TradeTable 
                trades={recentTrades} 
                showViewAll={trades.length > 5}
                onViewAll={() => {/* Navigate to full trades page */}}
              />
            </div>
          </div>

          <div className="space-y-6">
            <AIInsightsWidget />
            <QuickActions />
            <RiskMetrics
              sharpeRatio={portfolio?.sharpeRatio}
              maxDrawdown={portfolio?.maxDrawdown}
              profitFactor={portfolio?.profitFactor}
              riskPerTrade={portfolio?.riskPerTrade}
            />
          </div>
        </div>

        {/* Trading Education Section */}
        <div className="mt-8">
          <Card className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900" data-testid="education-section-title">
                Recommended Learning
              </h3>
              <button className="text-primary hover:text-blue-700 text-sm font-medium" data-testid="button-view-all-education">
                View All
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow" data-testid="education-card-risk">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Risk Management Basics</h4>
                <p className="text-sm text-gray-600">Learn proper position sizing and risk-to-reward ratios.</p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow" data-testid="education-card-technical">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                  <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                  </svg>
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Technical Analysis</h4>
                <p className="text-sm text-gray-600">Master chart patterns and technical indicators.</p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow" data-testid="education-card-psychology">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                  </svg>
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Psychology of Trading</h4>
                <p className="text-sm text-gray-600">Develop mental strategies for consistent performance.</p>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
