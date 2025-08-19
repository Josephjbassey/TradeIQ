import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Plus, 
  Settings, 
  TrendingUp, 
  DollarSign, 
  BarChart3, 
  Shield,
  Wifi,
  WifiOff,
  AlertCircle,
  Edit,
  Trash2
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { TradingAccount, InsertTradingAccount } from "@shared/schema";

const accountSchema = z.object({
  name: z.string().min(2, "Account name must be at least 2 characters"),
  broker: z.string().min(2, "Broker name is required"),
  accountType: z.enum(["live", "demo", "paper"], {
    required_error: "Please select an account type",
  }),
  accountNumber: z.string().optional(),
  initialBalance: z.number().min(0, "Initial balance must be positive"),
  currency: z.string().default("USD"),
});

type AccountForm = z.infer<typeof accountSchema>;

export default function Accounts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedAccount, setSelectedAccount] = useState<TradingAccount | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: accounts = [], isLoading } = useQuery<TradingAccount[]>({
    queryKey: ["/api/trading-accounts"],
  });

  const form = useForm<AccountForm>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: "",
      broker: "",
      accountType: "demo",
      accountNumber: "",
      initialBalance: 10000,
      currency: "USD",
    },
  });

  const createAccountMutation = useMutation({
    mutationFn: (data: InsertTradingAccount) => apiRequest("POST", "/api/trading-accounts", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trading-accounts"] });
      toast({
        title: "Account Created",
        description: "Your trading account has been added successfully!",
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create account",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateAccountMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TradingAccount> }) =>
      apiRequest("PATCH", `/api/trading-accounts/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trading-accounts"] });
      toast({
        title: "Account Updated",
        description: "Account settings have been saved.",
      });
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/trading-accounts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trading-accounts"] });
      toast({
        title: "Account Deleted",
        description: "The trading account has been removed.",
      });
    },
  });

  const onSubmit = (data: AccountForm) => {
    const accountData: InsertTradingAccount = {
      ...data,
      userId: "demo-user-123", // In real app, get from auth context
      currentBalance: data.initialBalance,
    };
    createAccountMutation.mutate(accountData);
  };

  const toggleAccountStatus = (account: TradingAccount) => {
    updateAccountMutation.mutate({
      id: account.id,
      data: { isActive: !account.isActive }
    });
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Trading Accounts" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-6 border border-gray-100">
                  <div className="h-4 bg-gray-300 rounded mb-4"></div>
                  <div className="h-8 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded"></div>
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
      <Header title="Trading Accounts" subtitle="Manage your trading accounts and portfolio allocation" />
      <main className="flex-1 overflow-y-auto p-6">
        {/* Action Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-medium text-gray-900">
              {accounts.length} Account{accounts.length !== 1 ? 's' : ''}
            </h2>
            <Badge variant="outline" className="text-green-600 border-green-200">
              {accounts.filter(a => a.isActive).length} Active
            </Badge>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-account">
                <Plus className="w-4 h-4 mr-2" />
                Add Account
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add Trading Account</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Main Trading Account" data-testid="input-account-name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="broker"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Broker</FormLabel>
                          <FormControl>
                            <Input placeholder="Interactive Brokers" data-testid="input-broker" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="accountType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-account-type">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="demo">Demo</SelectItem>
                              <SelectItem value="paper">Paper Trading</SelectItem>
                              <SelectItem value="live">Live Trading</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="accountNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Number (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="DU123456" data-testid="input-account-number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="initialBalance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Initial Balance</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0" 
                              step="0.01"
                              placeholder="10000"
                              data-testid="input-initial-balance"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Currency</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-currency">
                                <SelectValue placeholder="Currency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="USD">USD</SelectItem>
                              <SelectItem value="EUR">EUR</SelectItem>
                              <SelectItem value="GBP">GBP</SelectItem>
                              <SelectItem value="CAD">CAD</SelectItem>
                              <SelectItem value="AUD">AUD</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsDialogOpen(false)}
                      data-testid="button-cancel"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createAccountMutation.isPending}
                      data-testid="button-create-account"
                    >
                      {createAccountMutation.isPending ? "Creating..." : "Create Account"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Account Grid */}
        {accounts.length === 0 ? (
          <div className="text-center py-12">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Trading Accounts</h3>
            <p className="text-gray-600 mb-6">
              Add your first trading account to start tracking your trades and performance.
            </p>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-first-account">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Account
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.map((account) => (
              <Card 
                key={account.id} 
                className={`bg-white hover:shadow-lg transition-shadow ${
                  !account.isActive ? 'opacity-60' : ''
                }`}
                data-testid={`account-card-${account.id}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg font-medium">{account.name}</CardTitle>
                      <p className="text-sm text-gray-500 mt-1">{account.broker}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={account.accountType === 'live' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {account.accountType.toUpperCase()}
                      </Badge>
                      {account.connectionStatus === 'connected' ? (
                        <Wifi className="w-4 h-4 text-green-500" />
                      ) : account.connectionStatus === 'error' ? (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      ) : (
                        <WifiOff className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Current Balance</span>
                      <span className="text-lg font-semibold text-gray-900">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: account.currency || 'USD'
                        }).format(Number(account.currentBalance))}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">P&L</span>
                      <span className={`font-medium ${
                        Number(account.currentBalance) - Number(account.initialBalance) >= 0 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: account.currency || 'USD',
                          signDisplay: 'always'
                        }).format(Number(account.currentBalance) - Number(account.initialBalance))}
                      </span>
                    </div>

                    {account.accountNumber && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Account #</span>
                        <span className="text-sm font-mono text-gray-700">{account.accountNumber}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-2 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleAccountStatus(account)}
                        className={account.isActive ? 'text-orange-600' : 'text-green-600'}
                        data-testid={`button-toggle-${account.id}`}
                      >
                        {account.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedAccount(account)}
                          data-testid={`button-edit-${account.id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteAccountMutation.mutate(account.id)}
                          className="text-red-600 hover:text-red-700"
                          data-testid={`button-delete-${account.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Portfolio Overview */}
        {accounts.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Portfolio Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <DollarSign className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">Total Value</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD'
                        }).format(accounts.reduce((sum, acc) => sum + Number(acc.currentBalance), 0))}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">Total P&L</p>
                      <p className={`text-2xl font-semibold ${
                        accounts.reduce((sum, acc) => sum + (Number(acc.currentBalance) - Number(acc.initialBalance)), 0) >= 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                          signDisplay: 'always'
                        }).format(accounts.reduce((sum, acc) => sum + (Number(acc.currentBalance) - Number(acc.initialBalance)), 0))}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <BarChart3 className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">Active Accounts</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {accounts.filter(a => a.isActive).length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-orange-50 rounded-lg">
                      <Shield className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">Connected</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {accounts.filter(a => a.connectionStatus === 'connected').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}