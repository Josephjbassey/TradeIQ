import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus } from "lucide-react";
import { Link } from "wouter";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900" data-testid="page-title">
            {title}
          </h2>
          <p className="text-sm text-gray-500" data-testid="page-subtitle">
            {subtitle || currentDate}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/add-trade">
            <Button 
              className="bg-primary text-white hover:bg-blue-700 flex items-center"
              data-testid="button-new-trade"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Trade
            </Button>
          </Link>
          <Link href="/profile">
            <Avatar className="w-8 h-8 cursor-pointer" data-testid="user-avatar">
              <AvatarFallback className="bg-gray-300">U</AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>
    </header>
  );
}
