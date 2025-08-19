import { Card } from "@/components/ui/card";
import { TrendingUp, CheckCircle, BarChart3, DollarSign } from "lucide-react";

interface MetricsCardsProps {
  totalPnL: number;
  winRate: number;
  totalTrades: number;
  avgProfit: number;
}

export default function MetricsCards({ totalPnL, winRate, totalTrades, avgProfit }: MetricsCardsProps) {
  const metrics = [
    {
      title: "Total P&L",
      value: `${totalPnL >= 0 ? '+' : ''}$${totalPnL.toFixed(2)}`,
      change: "+12.3% this month",
      icon: TrendingUp,
      color: totalPnL >= 0 ? "text-success" : "text-danger",
      bgColor: totalPnL >= 0 ? "bg-green-100" : "bg-red-100",
      iconColor: totalPnL >= 0 ? "text-success" : "text-danger",
    },
    {
      title: "Win Rate",
      value: `${winRate.toFixed(1)}%`,
      change: "+2.1% vs last month",
      icon: CheckCircle,
      color: "text-gray-900",
      bgColor: "bg-blue-100",
      iconColor: "text-primary",
    },
    {
      title: "Total Trades",
      value: totalTrades.toString(),
      change: "23 this week",
      icon: BarChart3,
      color: "text-gray-900",
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      title: "Avg. Profit",
      value: `$${avgProfit.toFixed(2)}`,
      change: "Per winning trade",
      icon: DollarSign,
      color: "text-success",
      bgColor: "bg-orange-100",
      iconColor: "text-warning",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <Card key={metric.title} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600" data-testid={`metric-title-${index}`}>
                  {metric.title}
                </p>
                <p className={`text-2xl font-bold ${metric.color}`} data-testid={`metric-value-${index}`}>
                  {metric.value}
                </p>
                <p className="text-xs text-gray-500" data-testid={`metric-change-${index}`}>
                  {metric.change}
                </p>
              </div>
              <div className={`w-12 h-12 ${metric.bgColor} rounded-lg flex items-center justify-center`}>
                <Icon className={`w-6 h-6 ${metric.iconColor}`} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
