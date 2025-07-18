import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function CurrentStatusCard() {
  const { data: recentEpisodes } = useQuery({
    queryKey: ["/api/episodes", { limit: 5 }],
  });

  const { data: weeklyStats } = useQuery({
    queryKey: ["/api/analytics/weekly"],
  });

  const getStatusLevel = () => {
    if (!recentEpisodes || recentEpisodes.length === 0) {
      return { level: "No Active Episode", color: "bg-medical-success" };
    }
    
    const lastEpisode = recentEpisodes[0];
    const now = new Date();
    const episodeTime = new Date(lastEpisode.startTime);
    const hoursDiff = (now.getTime() - episodeTime.getTime()) / (1000 * 60 * 60);
    
    if (hoursDiff < 2 && !lastEpisode.endTime) {
      return { 
        level: `Active Episode - Level ${lastEpisode.intensity}`, 
        color: lastEpisode.intensity >= 7 ? "bg-medical-error" : "bg-medical-warning" 
      };
    }
    
    return { level: "No Active Episode", color: "bg-medical-success" };
  };

  const status = getStatusLevel();
  const lastUpdate = recentEpisodes && recentEpisodes.length > 0 
    ? new Date(recentEpisodes[0].startTime).toLocaleDateString()
    : "No episodes recorded";

  return (
    <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border">
      <div className="text-center">
        <div className="text-sm text-muted-foreground mb-1">Current Status</div>
        <div className="text-2xl font-bold text-primary mb-1">
          {status.level}
        </div>
        <div className="text-xs text-muted-foreground">
          Last episode: {lastUpdate}
        </div>
      </div>
      
      {/* Weekly statistics */}
      <div className="grid grid-cols-3 gap-3 mt-4">
        <Card className="p-3">
          <CardContent className="p-0 text-center">
            <div className="text-xs text-muted-foreground">This Week</div>
            <div className="text-lg font-semibold text-primary">
              {weeklyStats?.episodeCount || 0}
            </div>
            <div className="text-xs text-muted-foreground">Episodes</div>
          </CardContent>
        </Card>
        
        <Card className="p-3">
          <CardContent className="p-0 text-center">
            <div className="text-xs text-muted-foreground">Avg Intensity</div>
            <div className="text-lg font-semibold text-primary">
              {weeklyStats?.avgIntensity?.toFixed(1) || "0.0"}
            </div>
            <div className="text-xs text-muted-foreground">out of 10</div>
          </CardContent>
        </Card>
        
        <Card className="p-3">
          <CardContent className="p-0 text-center">
            <div className="text-xs text-muted-foreground">Medications</div>
            <div className="text-lg font-semibold text-primary">
              {weeklyStats?.medicationCount || 0}
            </div>
            <div className="text-xs text-muted-foreground">Taken</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
