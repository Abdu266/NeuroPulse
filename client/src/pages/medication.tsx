import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BottomNavigation } from "@/components/bottom-navigation";
import { ArrowLeft, Plus, Pill, Clock } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Medication() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: medications, isLoading: medicationsLoading } = useQuery({
    queryKey: ["/api/medications"],
  });

  const { data: medicationLogs, isLoading: logsLoading } = useQuery({
    queryKey: ["/api/medication-logs"],
  });

  const logMedicationMutation = useMutation({
    mutationFn: async (medicationId: number) => {
      return apiRequest("POST", "/api/medication-logs", {
        medicationId,
        takenAt: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medication-logs"] });
      toast({
        title: "Medication logged",
        description: "Your medication has been recorded successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to log medication. Please try again.",
        variant: "destructive",
      });
    },
  });

  const formatTimeAgo = (date: string | Date) => {
    const now = new Date();
    const logTime = new Date(date);
    const diffMs = now.getTime() - logTime.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return `${diffMins} minutes ago`;
    }
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  const getLastDoseTime = (medicationId: number) => {
    if (!medicationLogs) return null;
    const lastLog = medicationLogs.find(log => log.medicationId === medicationId);
    return lastLog ? new Date(lastLog.takenAt) : null;
  };

  const canTakeMedication = (medicationId: number) => {
    const lastDose = getLastDoseTime(medicationId);
    if (!lastDose) return true;
    
    const now = new Date();
    const hoursSince = (now.getTime() - lastDose.getTime()) / (1000 * 60 * 60);
    return hoursSince >= 4; // Minimum 4 hours between doses
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
            <h1 className="text-lg font-semibold">Medications</h1>
            <p className="text-sm opacity-90">Manage your treatment plan</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground hover:bg-white/20"
            onClick={() => toast({ title: "Add Medication", description: "Feature coming soon" })}
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Active Medications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Pill className="h-5 w-5" />
              <span>Active Medications</span>
            </CardTitle>
            <CardDescription>
              Your current medication regimen
            </CardDescription>
          </CardHeader>
          <CardContent>
            {medicationsLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-20 bg-muted rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : medications?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Pill className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No medications configured.</p>
                <Button 
                  className="mt-2"
                  onClick={() => toast({ title: "Add Medication", description: "Feature coming soon" })}
                >
                  Add Your First Medication
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {medications?.map((medication) => {
                  const lastDose = getLastDoseTime(medication.id);
                  const canTake = canTakeMedication(medication.id);
                  
                  return (
                    <Card key={medication.id} className="p-4">
                      <CardContent className="p-0">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-semibold">
                              {medication.name} {medication.dosage}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {medication.frequency}
                            </p>
                          </div>
                          <Badge 
                            variant={medication.isActive ? "default" : "secondary"}
                          >
                            {medication.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        
                        {lastDose && (
                          <div className="mb-3">
                            <p className="text-sm text-muted-foreground">
                              Last taken: {formatTimeAgo(lastDose)}
                            </p>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="text-sm">
                            {canTake ? (
                              <span className="text-medical-success">Ready to take</span>
                            ) : (
                              <span className="text-muted-foreground">
                                Wait {4 - Math.floor((new Date().getTime() - lastDose!.getTime()) / (1000 * 60 * 60))} hours
                              </span>
                            )}
                          </div>
                          <Button
                            size="sm"
                            disabled={!canTake || logMedicationMutation.isPending}
                            onClick={() => logMedicationMutation.mutate(medication.id)}
                            className="bg-medical-success hover:bg-medical-success/90"
                          >
                            {logMedicationMutation.isPending ? "Logging..." : "Mark Taken"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Medication Logs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Recent Activity</span>
            </CardTitle>
            <CardDescription>
              Your medication history
            </CardDescription>
          </CardHeader>
          <CardContent>
            {logsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-12 bg-muted rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : medicationLogs?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No medication logs yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {medicationLogs?.slice(0, 10).map((log) => {
                  const medication = medications?.find(m => m.id === log.medicationId);
                  
                  return (
                    <div key={log.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">
                          {medication?.name || 'Unknown Medication'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatTimeAgo(log.takenAt)}
                        </p>
                      </div>
                      {log.effectiveness && (
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {log.effectiveness}/10
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Effectiveness
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="pb-20">
        {/* Spacer for bottom navigation */}
      </div>

      <BottomNavigation />
    </div>
  );
}
