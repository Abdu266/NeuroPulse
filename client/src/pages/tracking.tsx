import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { BottomNavigation } from "@/components/bottom-navigation";
import { EpisodeModal } from "@/components/episode-modal";
import { ArrowLeft, Plus, Calendar as CalendarIcon } from "lucide-react";
import { useLocation } from "wouter";

export default function Tracking() {
  const [, setLocation] = useLocation();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [episodeModalOpen, setEpisodeModalOpen] = useState(false);

  const { data: episodes, isLoading } = useQuery({
    queryKey: ["/api/episodes"],
  });

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getIntensityColor = (intensity: number) => {
    if (intensity <= 3) return "bg-medical-success";
    if (intensity <= 6) return "bg-medical-warning";
    return "bg-medical-error";
  };

  const getIntensityLabel = (intensity: number) => {
    if (intensity <= 3) return "Mild";
    if (intensity <= 6) return "Moderate";
    return "Severe";
  };

  return (
    <div className="max-w-md mx-auto bg-background min-h-screen">
      {/* Header */}
      <header className="bg-primary text-primary-foreground p-4 sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground hover:bg-white/20"
            onClick={() => setLocation("/")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold">Episode Tracking</h1>
            <p className="text-sm opacity-90">Monitor your migraine patterns</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground hover:bg-white/20"
            onClick={() => setEpisodeModalOpen(true)}
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Calendar View */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CalendarIcon className="h-5 w-5" />
              <span>Calendar View</span>
            </CardTitle>
            <CardDescription>
              See your episodes on a calendar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="w-full"
            />
          </CardContent>
        </Card>

        {/* Recent Episodes */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Episodes</CardTitle>
            <CardDescription>
              Your migraine history and patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-muted rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : episodes?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No episodes recorded yet.</p>
                <Button 
                  className="mt-2"
                  onClick={() => setEpisodeModalOpen(true)}
                >
                  Log Your First Episode
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {episodes?.map((episode) => (
                  <Card key={episode.id} className="p-4">
                    <CardContent className="p-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge 
                              className={getIntensityColor(episode.intensity)}
                            >
                              {getIntensityLabel(episode.intensity)} ({episode.intensity}/10)
                            </Badge>
                            {episode.isEmergency && (
                              <Badge variant="destructive">Emergency</Badge>
                            )}
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-2">
                            {formatDate(episode.startTime)}
                            {episode.endTime && (
                              <> - {formatDate(episode.endTime)}</>
                            )}
                          </p>
                          
                          {episode.symptoms && episode.symptoms.length > 0 && (
                            <div className="mb-2">
                              <p className="text-xs font-medium mb-1">Symptoms:</p>
                              <div className="flex flex-wrap gap-1">
                                {episode.symptoms.map((symptom, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {symptom}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {episode.triggers && episode.triggers.length > 0 && (
                            <div className="mb-2">
                              <p className="text-xs font-medium mb-1">Triggers:</p>
                              <div className="flex flex-wrap gap-1">
                                {episode.triggers.map((trigger, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {trigger}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {episode.notes && (
                            <p className="text-sm text-muted-foreground mt-2">
                              {episode.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="pb-20">
        {/* Spacer for bottom navigation */}
      </div>

      <BottomNavigation />
      
      <EpisodeModal 
        open={episodeModalOpen}
        onOpenChange={setEpisodeModalOpen}
      />
    </div>
  );
}
