import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, BarChart3, Download } from "lucide-react";
import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function QuickActions() {
  const { toast } = useToast();

  const runAnalysisMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/analyses/portfolio"),
    onSuccess: () => {
      toast({
        title: "Analysis Complete",
        description: "Portfolio analysis has been generated!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleExportReport = () => {
    // Mock export functionality
    toast({
      title: "Export Started",
      description: "Your trading report is being generated...",
    });
  };

  return (
    <Card className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4" data-testid="quick-actions-title">
        Quick Actions
      </h3>
      
      <div className="space-y-3">
        <Link href="/add-trade">
          <Button 
            className="w-full bg-primary text-white hover:bg-blue-700 flex items-center justify-center"
            data-testid="button-add-new-trade"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Trade
          </Button>
        </Link>
        
        <Button 
          variant="secondary"
          className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center justify-center"
          onClick={() => runAnalysisMutation.mutate()}
          disabled={runAnalysisMutation.isPending}
          data-testid="button-run-analysis"
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          {runAnalysisMutation.isPending ? "Running..." : "Run AI Analysis"}
        </Button>
        
        <Button 
          variant="secondary"
          className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center justify-center"
          onClick={handleExportReport}
          data-testid="button-export-report"
        >
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>
    </Card>
  );
}
