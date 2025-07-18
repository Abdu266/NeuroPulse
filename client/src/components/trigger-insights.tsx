import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bed, CloudRain, Coffee, Zap, Sun, Utensils } from "lucide-react";

const triggerIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  sleep: Bed,
  weather: CloudRain,
  caffeine: Coffee,
  stress: Zap,
  light: Sun,
  food: Utensils,
};

export function TriggerInsights() {
  const { data: triggers, isLoading } = useQuery({
    queryKey: ["/api/triggers"],
  });

  if (isLoading) {
    return (
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold mb-3">Trigger Insights</h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-muted rounded-xl"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const getCorrelationLevel = (score: number | null) => {
    if (!score) return { level: "Unknown", color: "bg-muted" };
    if (score >= 0.7) return { level: "High", color: "bg-medical-error" };
    if (score >= 0.5) return { level: "Medium", color: "bg-medical-warning" };
    return { level: "Low", color: "bg-medical-gray" };
  };

  const getIconForTrigger = (triggerName: string) => {
    const name = triggerName.toLowerCase();
    for (const [key, Icon] of Object.entries(triggerIcons)) {
      if (name.includes(key)) {
        return Icon;
      }
    }
    return Zap; // Default icon
  };

  const topTriggers = triggers?.slice(0, 3) || [];

  return (
    <div className="p-4 border-b border-border">
      <h2 className="text-lg font-semibold mb-3">Trigger Insights</h2>
      
      {topTriggers.length === 0 ? (
        <Card className="p-4">
          <CardContent className="p-0 text-center text-muted-foreground">
            <p>No trigger data available yet.</p>
            <p className="text-sm mt-1">Log more episodes to see patterns.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {topTriggers.map((trigger) => {
            const correlation = getCorrelationLevel(trigger.correlationScore);
            const Icon = getIconForTrigger(trigger.name);
            
            return (
              <Card key={trigger.id} className="p-3">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 ${correlation.color} rounded-full flex items-center justify-center`}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <div className="font-medium">{trigger.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {trigger.correlationScore ? 
                            `${Math.round(trigger.correlationScore * 100)}% correlation` :
                            'Correlation unknown'
                          }
                        </div>
                      </div>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={correlation.color.replace('bg-', 'text-')}
                    >
                      {correlation.level}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
