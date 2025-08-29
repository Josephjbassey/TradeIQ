import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import MetricsCards from "@/components/dashboard/metrics-cards";
import PerformanceChart from "@/components/charts/performance-chart";
import TradeTable from "@/components/trade/trade-table";
import AIInsightsWidget from "@/components/dashboard/ai-insights-widget";
import QuickActions from "@/components/dashboard/quick-actions";
import RiskMetrics from "@/components/dashboard/risk-metrics";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Trade } from "@shared/schema";

export default function Dashboard() {
  const { data: trades = [], isLoading: tradesLoading } = useQuery<Trade[]>({
    queryKey: ["/api/trades"],
  });

  const { data: portfolio, isLoading: portfolioLoading } = useQuery<any>({
    queryKey: ["/api/portfolio/current"],
  });

  const { data: perfSeries = [], isLoading: perfLoading } = useQuery<{ date: string; value: number }[]>({
    queryKey: ["/api/portfolio/snapshots"],
  });

  // Use API-derived performance series (fallback to one point from current value)
  const performanceData = (perfSeries && perfSeries.length > 0)
    ? perfSeries
    : [{ date: new Date().toLocaleDateString(), value: portfolio?.totalValue || 10000 }];

  const recentTrades = (trades as Trade[]).slice(0, 5);
  const [education, setEducation] = useState<{ id: string; title: string; body: string }[]>([]);

  useEffect(() => {
    fetch("/api/cms/education")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setEducation(data?.recommendations || []))
      .catch(() => setEducation([]));
  }, []);

  if (tradesLoading || portfolioLoading || perfLoading) {
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
          <Card className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 transition-transform hover:shadow-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900" data-testid="education-section-title">
                Recommended Learning
              </h3>
              <button className="text-primary hover:text-blue-700 text-sm font-medium" data-testid="button-view-all-education">
                View All
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {education.map((rec) => (
                <div key={rec.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all hover:-translate-y-0.5">
                  <h4 className="font-medium text-gray-900 mb-2">{rec.title}</h4>
                  <p className="text-sm text-gray-600">{rec.body}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
