import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { useState } from "react";

interface PerformanceChartProps {
  data: Array<{
    date: string;
    value: number;
  }>;
}

export default function PerformanceChart({ data }: PerformanceChartProps) {
  const [timeframe, setTimeframe] = useState("1M");

  const timeframes = [
    { label: "1M", value: "1M" },
    { label: "3M", value: "3M" },
    { label: "1Y", value: "1Y" },
  ];

  const formatCurrency = (value: number) => `$${value.toLocaleString()}`;

  return (
    <Card className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900" data-testid="chart-title">
          Portfolio Performance
        </h3>
        <div className="flex space-x-2">
          {timeframes.map((tf) => (
            <Button
              key={tf.value}
              variant={timeframe === tf.value ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeframe(tf.value)}
              className={timeframe === tf.value ? "bg-primary text-white" : ""}
              data-testid={`timeframe-${tf.value}`}
            >
              {tf.label}
            </Button>
          ))}
        </div>
      </div>
      
      <div className="h-64" data-testid="performance-chart">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6B7280' }}
            />
            <YAxis 
              tickFormatter={formatCurrency}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6B7280' }}
            />
            <Tooltip 
              formatter={(value: number, name: string) => [formatCurrency(value), 'Portfolio Value']}
              labelStyle={{ color: '#374151' }}
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #E5E7EB',
                borderRadius: '8px'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#1E40AF" 
              strokeWidth={2}
              dot={false}
              fill="url(#gradient)"
            />
            <defs>
              <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1E40AF" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#1E40AF" stopOpacity={0}/>
              </linearGradient>
            </defs>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
