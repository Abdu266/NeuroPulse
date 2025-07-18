import { useState } from "react";
import { Brain, Moon, Phone } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { CurrentStatusCard } from "@/components/current-status-card";
import { WeeklyOverview } from "@/components/weekly-overview";
import { TriggerInsights } from "@/components/trigger-insights";
import { MedicationReminder } from "@/components/medication-reminder";
import { RecentActivity } from "@/components/recent-activity";
import { BottomNavigation } from "@/components/bottom-navigation";
import { EpisodeModal } from "@/components/episode-modal";
import { useQuery } from "@tanstack/react-query";

export default function Home() {
  const { theme, setTheme } = useTheme();
  const [, setLocation] = useLocation();
  const [episodeModalOpen, setEpisodeModalOpen] = useState(false);
  const [isEmergencyEpisode, setIsEmergencyEpisode] = useState(false);

  const { data: deviceData } = useQuery({
    queryKey: ["/api/device-data/latest"],
  });

  const handleEmergencyEpisode = () => {
    setIsEmergencyEpisode(true);
    setEpisodeModalOpen(true);
  };

  const handleRegularEpisode = () => {
    setIsEmergencyEpisode(false);
    setEpisodeModalOpen(true);
  };

  const handleEmergencyContacts = () => {
    // In a real app, this would open emergency contacts
    alert("Emergency contacts feature would be implemented here");
  };

  const toggleDarkMode = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const getDeviceStatus = () => {
    if (!deviceData) return "Device Disconnected";
    
    const now = new Date();
    const dataTime = new Date(deviceData.timestamp);
    const diffMinutes = (now.getTime() - dataTime.getTime()) / (1000 * 60);
    
    if (diffMinutes > 5) return "Device Disconnected";
    return "Device Connected";
  };

  return (
    <div className="max-w-md mx-auto bg-background min-h-screen shadow-xl">
      {/* Header */}
      <header className="bg-primary text-primary-foreground p-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Brain className="h-6 w-6" />
            <div>
              <div className="text-xs opacity-75">TechNeurology</div>
              <h1 className="text-lg font-semibold">NeuroRelief</h1>
              <div className="flex items-center space-x-2 text-xs opacity-90">
                <div className={`w-2 h-2 rounded-full ${
                  getDeviceStatus() === "Device Connected" 
                    ? "bg-green-400 animate-pulse" 
                    : "bg-red-400"
                }`} />
                <span>{getDeviceStatus()}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-primary-foreground hover:bg-white/20"
              onClick={toggleDarkMode}
            >
              <Moon className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-primary-foreground hover:bg-white/20"
              onClick={handleEmergencyContacts}
            >
              <Phone className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Current Status */}
      <CurrentStatusCard />

      {/* Quick Actions */}
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          <Button 
            className="bg-medical-error hover:bg-medical-error/90 text-white p-4 h-auto flex-col items-start"
            onClick={handleEmergencyEpisode}
          >
            <div className="text-xl mb-2">⚠️</div>
            <div className="font-semibold">Emergency Episode</div>
            <div className="text-xs opacity-90">Log severe migraine</div>
          </Button>
          
          <Button 
            className="bg-primary hover:bg-primary/90 text-primary-foreground p-4 h-auto flex-col items-start"
            onClick={handleRegularEpisode}
          >
            <div className="text-xl mb-2">➕</div>
            <div className="font-semibold">Log Episode</div>
            <div className="text-xs opacity-90">Track symptoms</div>
          </Button>
          
          <Button 
            className="bg-medical-success hover:bg-medical-success/90 text-white p-4 h-auto flex-col items-start"
            onClick={() => setLocation("/medication")}
          >
            <div className="text-xl mb-2">💊</div>
            <div className="font-semibold">Take Medication</div>
            <div className="text-xs opacity-90">Log treatment</div>
          </Button>
          
          <Button 
            className="bg-medical-gray hover:bg-medical-gray/90 text-white p-4 h-auto flex-col items-start"
            onClick={() => setLocation("/medical")}
          >
            <div className="text-xl mb-2">📋</div>
            <div className="font-semibold">Medical Log</div>
            <div className="text-xs opacity-90">Track symptoms</div>
          </Button>
        </div>
      </div>

      {/* Weekly Overview */}
      <WeeklyOverview />

      {/* Trigger Insights */}
      <TriggerInsights />

      {/* Medication Reminder */}
      <MedicationReminder />

      {/* Recent Activity */}
      <RecentActivity />

      {/* Bottom Navigation */}
      <BottomNavigation />

      {/* Episode Modal */}
      <EpisodeModal 
        open={episodeModalOpen}
        onOpenChange={setEpisodeModalOpen}
        isEmergency={isEmergencyEpisode}
      />
    </div>
  );
}
