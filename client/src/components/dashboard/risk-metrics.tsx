import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface RiskMetricsProps {
  sharpeRatio?: number | null;
  maxDrawdown?: number | null;
  profitFactor?: number | null;
  riskPerTrade?: number | null;
}

export default function RiskMetrics({ 
  sharpeRatio, 
  maxDrawdown, 
  profitFactor, 
  riskPerTrade 
}: RiskMetricsProps) {
  const formatMetric = (value: number | null | undefined, suffix = "") => {
    if (value === null || value === undefined) return "N/A";
    return `${value.toFixed(2)}${suffix}`;
  };

  const getValueColor = (value: number | null | undefined, type: string) => {
    if (value === null || value === undefined) return "text-gray-500";
    
    switch (type) {
      case "sharpe":
        return value > 1 ? "text-success" : value > 0.5 ? "text-warning" : "text-danger";
      case "drawdown":
        return "text-danger";
      case "profit":
        return value > 1.5 ? "text-success" : value > 1 ? "text-warning" : "text-danger";
      case "risk":
        return value <= 2 ? "text-success" : value <= 3 ? "text-warning" : "text-danger";
      default:
        return "text-gray-900";
    }
  };

  const metrics = [
    {
      label: "Sharpe Ratio",
      value: formatMetric(sharpeRatio),
      color: getValueColor(sharpeRatio, "sharpe"),
      testId: "sharpe-ratio"
    },
    {
      label: "Max Drawdown",
      value: formatMetric(maxDrawdown, "%"),
      color: getValueColor(maxDrawdown, "drawdown"),
      testId: "max-drawdown"
    },
    {
      label: "Profit Factor", 
      value: formatMetric(profitFactor),
      color: getValueColor(profitFactor, "profit"),
      testId: "profit-factor"
    },
    {
      label: "Risk per Trade",
      value: formatMetric(riskPerTrade, "%"),
      color: getValueColor(riskPerTrade, "risk"),
      testId: "risk-per-trade"
    },
  ];

  return (
    <Card className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4" data-testid="risk-metrics-title">
        Risk Metrics
      </h3>
      
      <div className="space-y-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="flex justify-between items-center">
            <span className="text-sm text-gray-600">{metric.label}</span>
            <span className={`font-medium ${metric.color}`} data-testid={metric.testId}>
              {metric.value}
            </span>
          </div>
        ))}
      </div>
      
      <Link href="/risk-management">
        <Button 
          variant="ghost"
          className="w-full mt-4 text-primary hover:text-blue-700 text-sm font-medium text-left justify-start p-0"
          data-testid="button-optimize-risk"
        >
          Optimize Risk Settings →
        </Button>
      </Link>
    </Card>
  );
}
