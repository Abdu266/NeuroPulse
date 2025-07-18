import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export function WeeklyOverview() {
  const { data: weeklyStats, isLoading } = useQuery({
    queryKey: ["/api/analytics/weekly"],
  });

  if (isLoading) {
    return (
      <div className="p-4 border-b border-border">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-32 mb-4"></div>
          <div className="h-24 bg-muted rounded mb-4"></div>
          <div className="grid grid-cols-3 gap-3">
            <div className="h-16 bg-muted rounded"></div>
            <div className="h-16 bg-muted rounded"></div>
            <div className="h-16 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const getIntensityColor = (intensity: number) => {
    if (intensity === 0) return "bg-muted";
    if (intensity <= 3) return "bg-medical-success";
    if (intensity <= 6) return "bg-medical-warning";
    return "bg-medical-error";
  };

  const getBarHeight = (intensity: number) => {
    return Math.max(4, (intensity / 10) * 48); // Minimum 4px, max 48px
  };

  return (
    <div className="p-4 border-b border-border">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">This Week</h2>
        <Link href="/tracking">
          <Button variant="ghost" size="sm" className="text-primary">
            View All
          </Button>
        </Link>
      </div>
      
      {/* Weekly episode chart */}
      <Card className="p-4 bg-muted/50">
        <CardContent className="p-0">
          <div className="flex items-end justify-between h-24 space-x-1">
            {weeklyStats?.weeklyData?.map((day, index) => (
              <div key={index} className="flex flex-col items-center space-y-1">
                <div 
                  className={`w-8 rounded-t ${getIntensityColor(day.intensity)}`}
                  style={{ height: `${getBarHeight(day.intensity)}px` }}
                />
                <span className={`text-xs ${day.day === 'Today' 
                  ? 'font-semibold text-primary' 
                  : 'text-muted-foreground'
                }`}>
                  {day.day}
                </span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground mt-3">
            <span>Low</span>
            <span>Episode Intensity</span>
            <span>Severe</span>
          </div>
        </CardContent>
      </Card>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3 mt-4">
        <div className="text-center">
          <div className="text-2xl font-bold medical-error">
            {weeklyStats?.episodeCount || 0}
          </div>
          <div className="text-xs text-muted-foreground">Episodes</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold medical-warning">
            {weeklyStats?.avgDuration ? `${weeklyStats.avgDuration}h` : "0h"}
          </div>
          <div className="text-xs text-muted-foreground">Avg Duration</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold medical-success">
            {weeklyStats?.medicationCount || 0}
          </div>
          <div className="text-xs text-muted-foreground">Medications</div>
        </div>
      </div>
    </div>
  );
}
