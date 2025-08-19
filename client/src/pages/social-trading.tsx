import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  Star, 
  TrendingUp, 
  TrendingDown, 
  Copy, 
  UserPlus, 
  UserMinus,
  Shield,
  Award,
  BarChart3,
  DollarSign,
  Search,
  Filter
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface TraderProfile {
  id: string;
  userId: string;
  displayName: string;
  bio?: string;
  tradingStyle?: string;
  specialties?: string[];
  verified: boolean;
  copierCount: number;
  totalCopiedTrades: number;
  monthlyPnl?: number;
  monthlyReturnPercent?: number;
  maxDrawdownPercent?: number;
  winRatePercent?: number;
  rating?: number;
  riskScore?: number;
  avatar?: string;
}

interface TradeSignal {
  id: string;
  symbol: string;
  side: string;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  trader: {
    displayName: string;
    avatar?: string;
  };
  createdAt: string;
}

export default function SocialTrading() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<"all" | "low" | "medium" | "high">("all");

  const { data: topTraders = [], isLoading: loadingTraders } = useQuery<TraderProfile[]>({
    queryKey: ["/api/social/top-traders"],
  });

  const { data: following = [], isLoading: loadingFollowing } = useQuery<TraderProfile[]>({
    queryKey: ["/api/social/following"],
  });

  const { data: liveSignals = [], isLoading: loadingSignals } = useQuery<TradeSignal[]>({
    queryKey: ["/api/social/live-signals"],
  });

  const followMutation = useMutation({
    mutationFn: (traderId: string) => apiRequest("POST", `/api/social/follow/${traderId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social/following"] });
      queryClient.invalidateQueries({ queryKey: ["/api/social/top-traders"] });
      toast({
        title: "Following trader",
        description: "You will now receive their trade signals.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to follow",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: (traderId: string) => apiRequest("DELETE", `/api/social/follow/${traderId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social/following"] });
      queryClient.invalidateQueries({ queryKey: ["/api/social/top-traders"] });
      toast({
        title: "Unfollowed trader",
        description: "You will no longer receive their signals.",
      });
    },
  });

  const copyTradeMutation = useMutation({
    mutationFn: (signalId: string) => apiRequest("POST", `/api/social/copy-trade/${signalId}`),
    onSuccess: () => {
      toast({
        title: "Trade copied",
        description: "The trade has been executed in your account.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Copy failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredTraders = topTraders.filter(trader => {
    const matchesSearch = trader.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trader.tradingStyle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trader.specialties?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRisk = selectedRiskLevel === "all" || 
      (selectedRiskLevel === "low" && (trader.riskScore || 0) <= 3) ||
      (selectedRiskLevel === "medium" && (trader.riskScore || 0) > 3 && (trader.riskScore || 0) <= 6) ||
      (selectedRiskLevel === "high" && (trader.riskScore || 0) > 6);

    return matchesSearch && matchesRisk;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getRiskBadgeColor = (riskScore: number) => {
    if (riskScore <= 3) return "bg-green-100 text-green-800";
    if (riskScore <= 6) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getRiskLabel = (riskScore: number) => {
    if (riskScore <= 3) return "Low Risk";
    if (riskScore <= 6) return "Medium Risk";
    return "High Risk";
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title="Social Trading" subtitle="Follow top traders and copy their strategies" />
      <main className="flex-1 overflow-y-auto p-6">
        <Tabs defaultValue="discover" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="discover" data-testid="tab-discover">Discover Traders</TabsTrigger>
            <TabsTrigger value="following" data-testid="tab-following">Following ({following.length})</TabsTrigger>
            <TabsTrigger value="signals" data-testid="tab-signals">Live Signals</TabsTrigger>
          </TabsList>

          <TabsContent value="discover" className="space-y-6">
            {/* Search and Filters */}
            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search traders by name, style, or specialty..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                        data-testid="input-search-traders"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={selectedRiskLevel === "all" ? "default" : "outline"}
                      onClick={() => setSelectedRiskLevel("all")}
                      size="sm"
                      data-testid="filter-all-risk"
                    >
                      All Risk
                    </Button>
                    <Button
                      variant={selectedRiskLevel === "low" ? "default" : "outline"}
                      onClick={() => setSelectedRiskLevel("low")}
                      size="sm"
                      data-testid="filter-low-risk"
                    >
                      Low Risk
                    </Button>
                    <Button
                      variant={selectedRiskLevel === "medium" ? "default" : "outline"}
                      onClick={() => setSelectedRiskLevel("medium")}
                      size="sm"
                      data-testid="filter-medium-risk"
                    >
                      Medium
                    </Button>
                    <Button
                      variant={selectedRiskLevel === "high" ? "default" : "outline"}
                      onClick={() => setSelectedRiskLevel("high")}
                      size="sm"
                      data-testid="filter-high-risk"
                    >
                      High Risk
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Traders Grid */}
            {loadingTraders ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="bg-white animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-16 bg-gray-300 rounded-full w-16 mx-auto mb-4"></div>
                      <div className="h-4 bg-gray-300 rounded mb-2"></div>
                      <div className="h-4 bg-gray-300 rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTraders.map((trader) => (
                  <Card key={trader.id} className="bg-white hover:shadow-lg transition-shadow" data-testid={`trader-card-${trader.id}`}>
                    <CardContent className="p-6">
                      <div className="text-center mb-4">
                        <Avatar className="w-16 h-16 mx-auto mb-3">
                          <AvatarImage src={trader.avatar} alt={trader.displayName} />
                          <AvatarFallback>{trader.displayName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        
                        <div className="flex items-center justify-center mb-2">
                          <h3 className="font-semibold text-lg">{trader.displayName}</h3>
                          {trader.verified && (
                            <Shield className="w-5 h-5 text-blue-500 ml-2" />
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3">{trader.tradingStyle}</p>
                        
                        <div className="flex items-center justify-center space-x-4 mb-4">
                          <div className="flex items-center">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-4 h-4 ${
                                  i < (trader.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`} 
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600">({trader.rating?.toFixed(1)})</span>
                        </div>

                        <Badge className={getRiskBadgeColor(trader.riskScore || 5)}>
                          {getRiskLabel(trader.riskScore || 5)}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        <div className="text-center">
                          <p className="text-gray-600">Monthly Return</p>
                          <p className={`font-semibold ${
                            (trader.monthlyReturnPercent || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {trader.monthlyReturnPercent ? `${trader.monthlyReturnPercent}%` : 'N/A'}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-600">Win Rate</p>
                          <p className="font-semibold text-gray-900">
                            {trader.winRatePercent ? `${trader.winRatePercent}%` : 'N/A'}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-600">Copiers</p>
                          <p className="font-semibold text-gray-900">{trader.copierCount}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-600">Max DD</p>
                          <p className="font-semibold text-red-600">
                            {trader.maxDrawdownPercent ? `${trader.maxDrawdownPercent}%` : 'N/A'}
                          </p>
                        </div>
                      </div>

                      {trader.specialties && trader.specialties.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-1">
                            {trader.specialties.slice(0, 3).map((specialty, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {specialty}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <Button 
                        onClick={() => followMutation.mutate(trader.userId)}
                        disabled={followMutation.isPending}
                        className="w-full"
                        data-testid={`button-follow-${trader.id}`}
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Follow Trader
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="following" className="space-y-6">
            {loadingFollowing ? (
              <div className="animate-pulse">
                <div className="h-32 bg-gray-300 rounded"></div>
              </div>
            ) : following.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Not Following Anyone Yet</h3>
                <p className="text-gray-600 mb-6">
                  Start following top traders to see their performance and copy their trades.
                </p>
                <Button onClick={() => document.querySelector('[data-testid="tab-discover"]')?.click()}>
                  Discover Traders
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {following.map((trader) => (
                  <Card key={trader.id} className="bg-white" data-testid={`following-card-${trader.id}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          <Avatar className="w-12 h-12 mr-4">
                            <AvatarImage src={trader.avatar} alt={trader.displayName} />
                            <AvatarFallback>{trader.displayName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center">
                              <h3 className="font-semibold">{trader.displayName}</h3>
                              {trader.verified && (
                                <Shield className="w-4 h-4 text-blue-500 ml-2" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{trader.tradingStyle}</p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => unfollowMutation.mutate(trader.userId)}
                          disabled={unfollowMutation.isPending}
                          data-testid={`button-unfollow-${trader.id}`}
                        >
                          <UserMinus className="w-4 h-4 mr-1" />
                          Unfollow
                        </Button>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="text-center">
                          <p className="text-gray-600">This Month</p>
                          <p className={`font-semibold ${
                            (trader.monthlyReturnPercent || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {trader.monthlyReturnPercent ? `${trader.monthlyReturnPercent}%` : 'N/A'}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-600">P&L</p>
                          <p className={`font-semibold ${
                            (trader.monthlyPnl || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {trader.monthlyPnl ? formatCurrency(trader.monthlyPnl) : 'N/A'}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-600">Rating</p>
                          <p className="font-semibold text-gray-900">
                            {trader.rating?.toFixed(1) || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="signals" className="space-y-6">
            {loadingSignals ? (
              <div className="animate-pulse space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-24 bg-gray-300 rounded"></div>
                ))}
              </div>
            ) : liveSignals.length === 0 ? (
              <div className="text-center py-12">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Live Signals</h3>
                <p className="text-gray-600">
                  Follow traders to see their live trading signals here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {liveSignals.map((signal) => (
                  <Card key={signal.id} className="bg-white" data-testid={`signal-card-${signal.id}`}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={signal.trader.avatar} alt={signal.trader.displayName} />
                            <AvatarFallback>{signal.trader.displayName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          
                          <div>
                            <div className="flex items-center space-x-2">
                              <Badge variant={signal.side === 'buy' ? 'default' : 'secondary'}>
                                {signal.side.toUpperCase()} {signal.symbol}
                              </Badge>
                              <span className="text-sm text-gray-500">by {signal.trader.displayName}</span>
                            </div>
                            <div className="flex items-center space-x-4 mt-1 text-sm">
                              <span>Entry: ${signal.entryPrice}</span>
                              <span>Current: ${signal.currentPrice}</span>
                              <span className={`font-semibold ${signal.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {signal.pnl >= 0 ? '+' : ''}{signal.pnlPercent}%
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <div className="text-right text-sm">
                            <p className="text-gray-600">P&L</p>
                            <p className={`font-semibold ${signal.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatCurrency(signal.pnl)}
                            </p>
                          </div>
                          
                          <Button
                            onClick={() => copyTradeMutation.mutate(signal.id)}
                            disabled={copyTradeMutation.isPending}
                            size="sm"
                            data-testid={`button-copy-${signal.id}`}
                          >
                            <Copy className="w-4 h-4 mr-1" />
                            Copy
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}