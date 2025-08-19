import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  TrendingUp, 
  Shield, 
  Brain, 
  Target, 
  BarChart3, 
  BookOpen,
  Users,
  Star,
  CheckCircle,
  ArrowRight
} from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-primary mr-2" />
              <span className="text-xl font-bold text-gray-900">TradeIQ</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/signin">
                <Button variant="ghost" data-testid="button-signin-nav">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button data-testid="button-signup-nav">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
            Master Your Trading with
            <span className="text-primary block">AI-Powered Insights</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Track, analyze, and improve your trading performance with our intelligent journal. 
            Get personalized insights, risk management tools, and educational content designed for beginner traders.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="text-lg px-8 py-3" data-testid="button-get-started">
                Start Trading Smarter
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="text-lg px-8 py-3" data-testid="button-learn-more">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comprehensive trading tools designed specifically for beginners who want to become profitable traders.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-6 hover:shadow-lg transition-shadow" data-testid="feature-ai-insights">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI-Powered Analysis</h3>
              <p className="text-gray-600">
                Get intelligent insights on your trading patterns, performance, and areas for improvement using advanced AI.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow" data-testid="feature-risk-management">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Risk Management</h3>
              <p className="text-gray-600">
                Built-in position sizing calculators, risk assessment tools, and automated alerts to protect your capital.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow" data-testid="feature-performance-tracking">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Performance Tracking</h3>
              <p className="text-gray-600">
                Detailed analytics, charts, and metrics to track your progress and identify successful strategies.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow" data-testid="feature-education">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Educational Resources</h3>
              <p className="text-gray-600">
                Curated learning modules, trading tips, and best practices to accelerate your trading education.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow" data-testid="feature-trade-journal">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Trade Journal</h3>
              <p className="text-gray-600">
                Comprehensive trade logging with automatic P&L calculation, notes, and performance analysis.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow" data-testid="feature-beginner-friendly">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Beginner Friendly</h3>
              <p className="text-gray-600">
                Designed specifically for new traders with guided workflows and educational support throughout.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Traders Choose TradeIQ
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join thousands of traders who have improved their performance with our platform.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="space-y-6">
                <div className="flex items-start" data-testid="benefit-improve-performance">
                  <CheckCircle className="w-6 h-6 text-green-500 mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Improve Performance by 40%</h3>
                    <p className="text-gray-600">Traders using structured journaling see significant improvement in their win rates and risk management.</p>
                  </div>
                </div>
                <div className="flex items-start" data-testid="benefit-save-time">
                  <CheckCircle className="w-6 h-6 text-green-500 mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Save 5+ Hours Weekly</h3>
                    <p className="text-gray-600">Automated calculations and AI insights eliminate manual analysis work.</p>
                  </div>
                </div>
                <div className="flex items-start" data-testid="benefit-reduce-losses">
                  <CheckCircle className="w-6 h-6 text-green-500 mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Reduce Emotional Trading</h3>
                    <p className="text-gray-600">Data-driven insights help you make objective decisions and stick to your strategy.</p>
                  </div>
                </div>
                <div className="flex items-start" data-testid="benefit-learn-faster">
                  <CheckCircle className="w-6 h-6 text-green-500 mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Learn Faster</h3>
                    <p className="text-gray-600">Personalized educational content adapts to your trading style and skill level.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto">
                <div className="flex items-center justify-center mb-4">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                </div>
                <blockquote className="text-gray-700 mb-4" data-testid="testimonial">
                  "TradeIQ transformed my trading completely. The AI insights helped me identify patterns I never noticed, and my win rate improved from 45% to 68% in just 3 months."
                </blockquote>
                <div className="text-sm text-gray-500">
                  <div className="font-semibold">Sarah Johnson</div>
                  <div>Day Trader, 2 years experience</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Take Your Trading to the Next Level?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of traders who are already using TradeIQ to improve their performance.
          </p>
          <Link href="/signup">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-3" data-testid="button-signup-cta">
              Start Your Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <p className="text-sm mt-4 opacity-75">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-primary mr-2" />
              <span className="text-lg font-semibold">TradeIQ</span>
            </div>
            <p className="text-gray-400 mb-4">
              Empowering traders with AI-powered insights and comprehensive tools.
            </p>
            <div className="flex justify-center space-x-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white">Privacy Policy</a>
              <a href="#" className="hover:text-white">Terms of Service</a>
              <a href="#" className="hover:text-white">Contact Us</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}