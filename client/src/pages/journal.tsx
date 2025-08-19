import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import TradeTable from "@/components/trade/trade-table";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import { useState } from "react";
import { Trade } from "@shared/schema";

export default function Journal() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const { data: trades = [], isLoading } = useQuery({
    queryKey: ["/api/trades"],
  });

  const filteredTrades = (trades as Trade[]).filter((trade) => {
    const matchesSearch = trade.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (trade.strategy && trade.strategy.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (trade.notes && trade.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || trade.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Trade Journal" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-300 rounded mb-6"></div>
            <div className="h-64 bg-gray-300 rounded"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title="Trade Journal" subtitle="Review and analyze your trading history" />
      <main className="flex-1 overflow-y-auto p-6">
        {/* Filters */}
        <Card className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by symbol, strategy, or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="search-trades"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48" data-testid="filter-status">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Trades</SelectItem>
                <SelectItem value="open">Open Positions</SelectItem>
                <SelectItem value="closed">Closed Positions</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 mb-1" data-testid="stat-total-trades">
                Total Trades
              </p>
              <p className="text-2xl font-bold text-gray-900" data-testid="stat-total-trades-value">
                {filteredTrades.length}
              </p>
            </div>
          </Card>

          <Card className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 mb-1" data-testid="stat-open-trades">
                Open Positions
              </p>
              <p className="text-2xl font-bold text-primary" data-testid="stat-open-trades-value">
                {filteredTrades.filter(t => t.status === 'open').length}
              </p>
            </div>
          </Card>

          <Card className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 mb-1" data-testid="stat-closed-trades">
                Closed Positions
              </p>
              <p className="text-2xl font-bold text-gray-900" data-testid="stat-closed-trades-value">
                {filteredTrades.filter(t => t.status === 'closed').length}
              </p>
            </div>
          </Card>
        </div>

        {/* Trades Table */}
        <TradeTable trades={filteredTrades} />

        {filteredTrades.length === 0 && (
          <Card className="bg-white rounded-xl shadow-sm p-12 border border-gray-100 mt-8">
            <div className="text-center">
              <p className="text-gray-500 mb-4" data-testid="no-trades-found">
                {searchTerm || statusFilter !== "all" 
                  ? "No trades match your current filters." 
                  : "No trades recorded yet."
                }
              </p>
              <Button 
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
                variant="outline"
                data-testid="button-clear-filters"
              >
                Clear Filters
              </Button>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
