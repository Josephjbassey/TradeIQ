import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trade } from "@shared/schema";

interface TradeTableProps {
  trades: Trade[];
  showViewAll?: boolean;
  onViewAll?: () => void;
}

export default function TradeTable({ trades, showViewAll = false, onViewAll }: TradeTableProps) {
  const formatCurrency = (value: number | null) => 
    value ? `$${Number(value).toFixed(2)}` : '-';

  const formatDate = (date: Date | string) => 
    new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <Card className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900" data-testid="trades-table-title">
          Recent Trades
        </h3>
        {showViewAll && (
          <Button
            variant="ghost"
            onClick={onViewAll}
            className="text-primary hover:text-blue-700 text-sm font-medium"
            data-testid="button-view-all-trades"
          >
            View All
          </Button>
        )}
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full" data-testid="trades-table">
          <thead>
            <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
              <th className="py-3">Symbol</th>
              <th className="py-3">Side</th>
              <th className="py-3">Size</th>
              <th className="py-3">Entry</th>
              <th className="py-3">Exit</th>
              <th className="py-3">P&L</th>
              <th className="py-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {trades.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-500" data-testid="no-trades-message">
                  No trades recorded yet. <br />
                  <span className="text-sm">Start by adding your first trade!</span>
                </td>
              </tr>
            ) : (
              trades.map((trade) => (
                <tr key={trade.id} data-testid={`trade-row-${trade.id}`}>
                  <td className="py-4 font-medium text-gray-900" data-testid={`trade-symbol-${trade.id}`}>
                    {trade.symbol}
                  </td>
                  <td className="py-4">
                    <Badge 
                      variant={trade.side === 'buy' ? 'default' : 'destructive'}
                      className={`px-2 py-1 text-xs rounded-full ${
                        trade.side === 'buy' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}
                      data-testid={`trade-side-${trade.id}`}
                    >
                      {trade.side.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="py-4 text-gray-600" data-testid={`trade-quantity-${trade.id}`}>
                    {trade.quantity}
                  </td>
                  <td className="py-4 text-gray-600" data-testid={`trade-entry-${trade.id}`}>
                    {formatCurrency(Number(trade.entryPrice))}
                  </td>
                  <td className="py-4 text-gray-600" data-testid={`trade-exit-${trade.id}`}>
                    {trade.exitPrice ? formatCurrency(Number(trade.exitPrice)) : '-'}
                  </td>
                  <td className="py-4 font-medium" data-testid={`trade-pnl-${trade.id}`}>
                    {trade.pnl ? (
                      <span className={Number(trade.pnl) >= 0 ? 'text-success' : 'text-danger'}>
                        {Number(trade.pnl) >= 0 ? '+' : ''}{formatCurrency(Number(trade.pnl))}
                      </span>
                    ) : (
                      <span className="text-gray-500">Open</span>
                    )}
                  </td>
                  <td className="py-4 text-gray-500 text-sm" data-testid={`trade-date-${trade.id}`}>
                    {formatDate(trade.entryDate)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
