import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-white to-gray-50">
    <Card className="w-full max-w-lg mx-4 border border-gray-200 shadow-sm transition-transform hover:shadow-md">
        <CardContent className="pt-8 pb-6">
      <img src="https://illustrations.popsy.co/teal/error-404.svg" alt="Not found" className="w-40 mx-auto mb-4 animate-fade-in" />
          <div className="flex mb-4 gap-3 items-center">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">Page not found</h1>
          </div>
          <p className="text-gray-600">The page you’re looking for doesn’t exist or was moved.</p>
          <div className="mt-6 flex gap-3">
            <Link href="/"><Button>Go Home</Button></Link>
            <Link href="/dashboard"><Button variant="outline">Dashboard</Button></Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
