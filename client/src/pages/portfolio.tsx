import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import PerformanceChart from "@/components/charts/performance-chart";
import { Card } from "@/components/ui/card";

export default function Portfolio() {
  const { data: portfolio, isLoading } = useQuery<any>({
    queryKey: ["/api/portfolio/current"],
  });

  // Mock performance data - in real app this would come from snapshots
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

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Portfolio" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="animate-pulse">
            <div className="h-64 bg-gray-300 rounded-xl mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-6 border border-gray-100">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-8 bg-gray-300 rounded"></div>
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
      <Header title="Portfolio" subtitle="Track your trading performance" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-8">
          <PerformanceChart data={performanceData} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 mb-1" data-testid="portfolio-total-value-label">
                Total Portfolio Value
              </p>
              <p className="text-3xl font-bold text-gray-900" data-testid="portfolio-total-value">
                ${portfolio?.totalValue?.toFixed(2) || '10,000.00'}
              </p>
            </div>
          </Card>

          <Card className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 mb-1" data-testid="portfolio-total-pnl-label">
                Total P&L
              </p>
              <p className={`text-3xl font-bold ${
                (portfolio?.totalPnl || 0) >= 0 ? 'text-success' : 'text-danger'
              }`} data-testid="portfolio-total-pnl">
                {(portfolio?.totalPnl || 0) >= 0 ? '+' : ''}${portfolio?.totalPnl?.toFixed(2) || '0.00'}
              </p>
            </div>
          </Card>

          <Card className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 mb-1" data-testid="portfolio-win-rate-label">
                Win Rate
              </p>
              <p className="text-3xl font-bold text-gray-900" data-testid="portfolio-win-rate">
                {portfolio?.winRate?.toFixed(1) || '0.0'}%
              </p>
            </div>
          </Card>

          <Card className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 mb-1" data-testid="portfolio-profit-factor-label">
                Profit Factor
              </p>
              <p className="text-3xl font-bold text-gray-900" data-testid="portfolio-profit-factor">
                {portfolio?.profitFactor?.toFixed(2) || 'N/A'}
              </p>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <Card className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4" data-testid="performance-metrics-title">
              Performance Metrics
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Trades</span>
                <span className="font-medium text-gray-900" data-testid="metric-total-trades">
                  {portfolio?.totalTrades || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Average Profit</span>
                <span className="font-medium text-success" data-testid="metric-avg-profit">
                  ${portfolio?.avgProfit?.toFixed(2) || '0.00'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Sharpe Ratio</span>
                <span className="font-medium text-gray-900" data-testid="metric-sharpe-ratio">
                  {portfolio?.sharpeRatio?.toFixed(2) || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Max Drawdown</span>
                <span className="font-medium text-danger" data-testid="metric-max-drawdown">
                  {portfolio?.maxDrawdown ? `${portfolio.maxDrawdown.toFixed(2)}%` : 'N/A'}
                </span>
              </div>
            </div>
          </Card>

          <Card className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4" data-testid="allocation-title">
              Portfolio Allocation
            </h3>
            <div className="text-center py-8">
              <p className="text-gray-500" data-testid="allocation-placeholder">
                Portfolio allocation breakdown will be available <br />
                once you have multiple positions.
              </p>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
