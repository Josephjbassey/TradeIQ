import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Shield, Calculator, AlertTriangle, TrendingUp, DollarSign } from "lucide-react";

export default function RiskManagement() {
  const [accountSize, setAccountSize] = useState<number>(10000);
  const [riskPerTrade, setRiskPerTrade] = useState<number>(2);
  const [entryPrice, setEntryPrice] = useState<number>(0);
  const [stopLoss, setStopLoss] = useState<number>(0);

  const { data: portfolio } = useQuery<any>({
    queryKey: ["/api/portfolio/current"],
  });

  // Position sizing calculator
  const calculatePosition = () => {
    if (entryPrice <= 0 || stopLoss <= 0 || entryPrice <= stopLoss) return null;
    
    const riskAmount = accountSize * (riskPerTrade / 100);
    const riskPerShare = entryPrice - stopLoss;
    const shares = Math.floor(riskAmount / riskPerShare);
    const totalCost = shares * entryPrice;
    const riskRewardRatio = riskPerShare / (entryPrice * 0.1); // Assuming 10% target
    
    return {
      shares,
      totalCost,
      riskAmount,
      riskPerShare,
      riskRewardRatio,
    };
  };

  const positionData = calculatePosition();

  const riskMetrics = [
    {
      title: "Portfolio Risk",
      value: `${portfolio?.riskPerTrade?.toFixed(1) || '2.0'}%`,
      status: (portfolio?.riskPerTrade || 2) <= 2 ? 'safe' : (portfolio?.riskPerTrade || 2) <= 3 ? 'moderate' : 'high',
      icon: Shield,
    },
    {
      title: "Max Drawdown",
      value: `${portfolio?.maxDrawdown?.toFixed(1) || '0.0'}%`,
      status: Math.abs(portfolio?.maxDrawdown || 0) <= 5 ? 'safe' : Math.abs(portfolio?.maxDrawdown || 0) <= 10 ? 'moderate' : 'high',
      icon: TrendingUp,
    },
    {
      title: "Profit Factor",
      value: portfolio?.profitFactor?.toFixed(2) || 'N/A',
      status: (portfolio?.profitFactor || 0) >= 1.5 ? 'safe' : (portfolio?.profitFactor || 0) >= 1 ? 'moderate' : 'high',
      icon: DollarSign,
    },
    {
      title: "Sharpe Ratio",
      value: portfolio?.sharpeRatio?.toFixed(2) || 'N/A',
      status: (portfolio?.sharpeRatio || 0) >= 1 ? 'safe' : (portfolio?.sharpeRatio || 0) >= 0.5 ? 'moderate' : 'high',
      icon: Calculator,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return 'text-success bg-green-100';
      case 'moderate': return 'text-warning bg-yellow-100';
      case 'high': return 'text-danger bg-red-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'safe': return 'Good';
      case 'moderate': return 'Moderate';
      case 'high': return 'High Risk';
      default: return 'Unknown';
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title="Risk Management" subtitle="Monitor and optimize your trading risk" />
      <main className="flex-1 overflow-y-auto p-6">
        
        {/* Risk Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {riskMetrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <Card key={metric.title} className="bg-white rounded-xl shadow-sm border border-gray-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1" data-testid={`risk-metric-title-${index}`}>
                        {metric.title}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 mb-2" data-testid={`risk-metric-value-${index}`}>
                        {metric.value}
                      </p>
                      <Badge 
                        className={`text-xs px-2 py-1 ${getStatusColor(metric.status)}`}
                        data-testid={`risk-metric-status-${index}`}
                      >
                        {getStatusText(metric.status)}
                      </Badge>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Position Size Calculator */}
          <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
            <CardHeader>
              <CardTitle className="flex items-center" data-testid="position-calculator-title">
                <Calculator className="w-5 h-5 mr-2 text-primary" />
                Position Size Calculator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="accountSize">Account Size ($)</Label>
                  <Input
                    id="accountSize"
                    type="number"
                    value={accountSize}
                    onChange={(e) => setAccountSize(Number(e.target.value))}
                    placeholder="10000"
                    data-testid="input-account-size"
                  />
                </div>
                
                <div>
                  <Label htmlFor="riskPerTrade">Risk per Trade (%)</Label>
                  <Input
                    id="riskPerTrade"
                    type="number"
                    step="0.1"
                    value={riskPerTrade}
                    onChange={(e) => setRiskPerTrade(Number(e.target.value))}
                    placeholder="2"
                    data-testid="input-risk-per-trade"
                  />
                </div>
                
                <div>
                  <Label htmlFor="entryPrice">Entry Price ($)</Label>
                  <Input
                    id="entryPrice"
                    type="number"
                    step="0.01"
                    value={entryPrice}
                    onChange={(e) => setEntryPrice(Number(e.target.value))}
                    placeholder="150.00"
                    data-testid="input-entry-price"
                  />
                </div>
                
                <div>
                  <Label htmlFor="stopLoss">Stop Loss ($)</Label>
                  <Input
                    id="stopLoss"
                    type="number"
                    step="0.01"
                    value={stopLoss}
                    onChange={(e) => setStopLoss(Number(e.target.value))}
                    placeholder="145.00"
                    data-testid="input-stop-loss"
                  />
                </div>
              </div>

              {positionData && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg" data-testid="position-results">
                  <h4 className="font-medium text-gray-900 mb-3">Calculated Position</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Shares to buy:</span>
                      <span className="font-medium ml-2" data-testid="result-shares">
                        {positionData.shares.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Total cost:</span>
                      <span className="font-medium ml-2" data-testid="result-total-cost">
                        ${positionData.totalCost.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Risk amount:</span>
                      <span className="font-medium ml-2 text-danger" data-testid="result-risk-amount">
                        ${positionData.riskAmount.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Risk per share:</span>
                      <span className="font-medium ml-2" data-testid="result-risk-per-share">
                        ${positionData.riskPerShare.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Risk Guidelines */}
          <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
            <CardHeader>
              <CardTitle className="flex items-center" data-testid="risk-guidelines-title">
                <AlertTriangle className="w-5 h-5 mr-2 text-warning" />
                Risk Management Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-l-4 border-primary bg-blue-50 p-4 rounded">
                  <h4 className="font-medium text-gray-900 mb-2">Position Sizing</h4>
                  <p className="text-sm text-gray-600">
                    Never risk more than 1-2% of your account on a single trade. This ensures you can survive a string of losses.
                  </p>
                </div>
                
                <div className="border-l-4 border-success bg-green-50 p-4 rounded">
                  <h4 className="font-medium text-gray-900 mb-2">Stop Losses</h4>
                  <p className="text-sm text-gray-600">
                    Always set stop losses before entering a trade. They should be based on technical levels, not arbitrary percentages.
                  </p>
                </div>
                
                <div className="border-l-4 border-warning bg-yellow-50 p-4 rounded">
                  <h4 className="font-medium text-gray-900 mb-2">Risk-Reward Ratio</h4>
                  <p className="text-sm text-gray-600">
                    Aim for at least 1:2 risk-reward ratio. If you risk $1, you should aim to make at least $2.
                  </p>
                </div>
                
                <div className="border-l-4 border-danger bg-red-50 p-4 rounded">
                  <h4 className="font-medium text-gray-900 mb-2">Diversification</h4>
                  <p className="text-sm text-gray-600">
                    Don't put all your capital in one trade or sector. Spread risk across multiple uncorrelated positions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Risk Progress Tracking */}
        <Card className="bg-white rounded-xl shadow-sm border border-gray-100 mt-8">
          <CardHeader>
            <CardTitle data-testid="risk-progress-title">Risk Progress Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">Daily Risk Usage</span>
                  <span className="text-sm text-gray-900" data-testid="daily-risk-usage">1.2% / 5.0%</span>
                </div>
                <Progress value={24} className="h-2" data-testid="daily-risk-progress" />
                <p className="text-xs text-gray-500 mt-1">Safe - within daily limits</p>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">Weekly Risk Usage</span>
                  <span className="text-sm text-gray-900" data-testid="weekly-risk-usage">3.8% / 10.0%</span>
                </div>
                <Progress value={38} className="h-2" data-testid="weekly-risk-progress" />
                <p className="text-xs text-gray-500 mt-1">Moderate - monitor closely</p>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">Monthly Risk Usage</span>
                  <span className="text-sm text-gray-900" data-testid="monthly-risk-usage">8.5% / 20.0%</span>
                </div>
                <Progress value={42.5} className="h-2" data-testid="monthly-risk-progress" />
                <p className="text-xs text-gray-500 mt-1">Good - sustainable pace</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
