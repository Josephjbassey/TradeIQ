import { useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, TrendingUp, Shield, Users, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const signinSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type SigninForm = z.infer<typeof signinSchema>;

export default function SignIn() {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SigninForm>({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SigninForm) => {
    setIsLoading(true);
    try {
      // Mock authentication - In real app, call your auth API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Welcome back!",
        description: "You have been signed in successfully.",
      });
      
      // Redirect to dashboard
      window.location.href = "/dashboard";
    } catch (error) {
      toast({
        title: "Sign in failed",
        description: "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding and Features */}
        <div className="text-center lg:text-left space-y-8">
          <div>
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-4">
              Trade<span className="text-blue-600">IQ</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              AI-powered trading journal for smarter trading decisions
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col items-center lg:items-start space-y-2">
              <div className="p-3 bg-blue-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">AI Analysis</h3>
              <p className="text-sm text-gray-600 text-center lg:text-left">
                Get intelligent insights on your trading performance
              </p>
            </div>
            
            <div className="flex flex-col items-center lg:items-start space-y-2">
              <div className="p-3 bg-green-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Multi-Account</h3>
              <p className="text-sm text-gray-600 text-center lg:text-left">
                Manage multiple trading accounts in one place
              </p>
            </div>
            
            <div className="flex flex-col items-center lg:items-start space-y-2">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Social Trading</h3>
              <p className="text-sm text-gray-600 text-center lg:text-left">
                Follow and copy successful traders
              </p>
            </div>
            
            <div className="flex flex-col items-center lg:items-start space-y-2">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Shield className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Risk Management</h3>
              <p className="text-sm text-gray-600 text-center lg:text-left">
                Advanced tools to protect your capital
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Sign In Form */}
        <Card className="w-full max-w-md mx-auto bg-white shadow-xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
            <p className="text-gray-600">Welcome back to your trading journey</p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input 
                          type="email"
                          placeholder="john@example.com"
                          data-testid="input-email"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            data-testid="input-password"
                            {...field} 
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                            data-testid="button-toggle-password"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center justify-between">
                  <Link href="/auth/forgot-password">
                    <Button variant="link" className="px-0 text-sm">
                      Forgot password?
                    </Button>
                  </Link>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                  data-testid="button-signin"
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </Form>

            <Separator />

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link href="/auth/signup">
                  <Button variant="link" className="px-0 text-sm">
                    Sign up now
                  </Button>
                </Link>
              </p>
            </div>

            {/* Demo Account */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Try Demo Account</h4>
              <p className="text-sm text-blue-700 mb-3">
                Explore TradeIQ with pre-loaded demo data
              </p>
              <Button 
                variant="outline" 
                className="w-full border-blue-300 text-blue-700 hover:bg-blue-100"
                onClick={() => window.location.href = "/dashboard"}
                data-testid="button-demo"
              >
                Continue with Demo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}