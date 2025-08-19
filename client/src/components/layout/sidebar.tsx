import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard,
  Plus,
  BarChart3,
  BookOpen,
  Lightbulb,
  Shield,
  GraduationCap
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Add Trade", href: "/add-trade", icon: Plus },
  { name: "Portfolio", href: "/portfolio", icon: BarChart3 },
  { name: "Trade Journal", href: "/journal", icon: BookOpen },
  { name: "AI Insights", href: "/ai-insights", icon: Lightbulb },
  { name: "Risk Management", href: "/risk-management", icon: Shield },
  { name: "Education", href: "/education", icon: GraduationCap },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 bg-white shadow-lg flex-shrink-0" data-testid="sidebar">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">TradeIQ</h1>
        <p className="text-sm text-gray-500">AI Trading Journal</p>
      </div>
      
      <nav className="mt-6">
        {navigation.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.name} 
              href={item.href}
              data-testid={`nav-link-${item.name.toLowerCase().replace(' ', '-')}`}
            >
              <div
                className={cn(
                  "flex items-center px-6 py-3 text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer",
                  isActive && "text-primary bg-blue-50 border-r-2 border-primary"
                )}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.name}
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
