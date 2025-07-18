import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Pill, TrendingUp } from "lucide-react";
import { Link } from "wouter";

export function RecentActivity() {
  const { data: episodes } = useQuery({
    queryKey: ["/api/episodes", { limit: 3 }],
  });

  const { data: medicationLogs } = useQuery({
    queryKey: ["/api/medication-logs", { limit: 3 }],
  });

  // Combine and sort activities
  const activities = [];
  
  if (episodes) {
    episodes.forEach(episode => {
      activities.push({
        id: `episode-${episode.id}`,
        type: 'episode',
        description: episode.isEmergency 
          ? 'Emergency migraine episode logged'
          : `${episode.intensity >= 7 ? 'Severe' : episode.intensity >= 4 ? 'Moderate' : 'Mild'} migraine episode logged`,
        time: new Date(episode.startTime),
        icon: AlertTriangle,
        color: episode.intensity >= 7 ? 'bg-medical-error' : 'bg-medical-warning',
      });
    });
  }
  
  if (medicationLogs) {
    medicationLogs.forEach(log => {
      activities.push({
        id: `med-${log.id}`,
        type: 'medication',
        description: 'Medication taken',
        time: new Date(log.takenAt),
        icon: Pill,
        color: 'bg-medical-success',
      });
    });
  }

  // Sort by time (most recent first)
  activities.sort((a, b) => b.time.getTime() - a.time.getTime());
  
  const recentActivities = activities.slice(0, 3);

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return `${diffMins} minutes ago`;
    }
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-3">Recent Activity</h2>
      
      {recentActivities.length === 0 ? (
        <Card className="p-4">
          <CardContent className="p-0 text-center text-muted-foreground">
            <p>No recent activity to display.</p>
            <p className="text-sm mt-1">Start logging episodes to see your activity.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {recentActivities.map((activity) => {
            const Icon = activity.icon;
            
            return (
              <Card key={activity.id}>
                <CardContent className="p-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 ${activity.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{activity.description}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatTimeAgo(activity.time)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      
      <Link href="/tracking">
        <Button variant="outline" className="w-full mt-4">
          View All Activity
        </Button>
      </Link>
    </div>
  );
}
