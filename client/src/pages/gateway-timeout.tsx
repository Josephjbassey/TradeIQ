import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function GatewayTimeout() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-white to-gray-50">
    <Card className="w-full max-w-lg mx-4 border border-gray-200 shadow-sm transition-transform hover:shadow-md">
        <CardContent className="pt-8 pb-6">
      <img src="https://illustrations.popsy.co/teal/server-down.svg" alt="Server timeout" className="w-40 mx-auto mb-4 animate-fade-in" />
          <h1 className="text-2xl font-bold text-gray-900">504 Gateway Timeout</h1>
          <p className="text-gray-600 mt-2">The server took too long to respond. Please try again in a moment.</p>
          <div className="mt-6 flex gap-3">
            <Link href="/"><Button>Go Home</Button></Link>
            <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
