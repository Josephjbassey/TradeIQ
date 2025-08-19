import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { TrendingUp, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const signinSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type SigninForm = z.infer<typeof signinSchema>;

export default function SignIn() {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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
      // Simulate authentication - in real app this would call your auth API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo purposes, accept any email/password combination
      toast({
        title: "Welcome back!",
        description: "You've been signed in successfully.",
      });
      
      // Redirect to dashboard
      setLocation("/dashboard");
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
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/">
            <div className="flex items-center justify-center mb-4 cursor-pointer">
              <TrendingUp className="w-8 h-8 text-primary mr-2" />
              <span className="text-2xl font-bold text-gray-900">TradeIQ</span>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-600 mt-2">Sign in to your trading journal</p>
        </div>

        {/* Sign In Form */}
        <Card className="bg-white shadow-xl">
          <CardHeader>
            <CardTitle className="text-center">Sign In</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter your email"
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
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center justify-between text-sm">
                  <Link href="/forgot-password">
                    <span className="text-primary hover:underline cursor-pointer" data-testid="link-forgot-password">
                      Forgot password?
                    </span>
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

                <div className="text-center text-sm text-gray-600">
                  Don't have an account?{" "}
                  <Link href="/signup">
                    <span className="text-primary hover:underline font-medium cursor-pointer" data-testid="link-signup">
                      Sign up here
                    </span>
                  </Link>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Demo Notice */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800 text-center">
            <strong>Demo Mode:</strong> Use any email and password to sign in
          </p>
        </div>
      </div>
    </div>
  );
}