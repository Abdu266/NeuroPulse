import { Home, TrendingUp, Pill, Stethoscope, FileText, User } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Tracking", href: "/tracking", icon: TrendingUp },
  { name: "Medication", href: "/medication", icon: Pill },
  { name: "Medical", href: "/medical", icon: Stethoscope },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Profile", href: "/profile", icon: User },
];

export function BottomNavigation() {
  const [location, setLocation] = useLocation();

  return (
    <nav className="sticky bottom-0 bg-background border-t border-border p-2">
      <div className="flex items-center justify-around">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href || 
            (item.href !== "/" && location.startsWith(item.href));

          return (
            <Button
              key={item.name}
              variant="ghost"
              className={cn(
                "flex flex-col items-center space-y-1 p-2 h-auto",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
              onClick={() => setLocation(item.href)}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.name}</span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
