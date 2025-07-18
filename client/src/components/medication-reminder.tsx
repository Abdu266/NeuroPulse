import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Pill } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export function MedicationReminder() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: medications } = useQuery({
    queryKey: ["/api/medications"],
  });

  const { data: medicationLogs } = useQuery({
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
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to log medication. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Get the primary medication (first active one)
  const primaryMedication = medications?.[0];
  
  // Calculate effectiveness for primary medication
  const { data: effectiveness } = useQuery({
    queryKey: ["/api/medications", primaryMedication?.id, "effectiveness"],
    enabled: !!primaryMedication?.id,
  });

  // Get last dose time
  const lastDose = medicationLogs?.find(log => 
    log.medicationId === primaryMedication?.id
  );

  const getNextDoseTime = () => {
    if (!lastDose) return "Take as needed";
    
    const lastTaken = new Date(lastDose.takenAt);
    const now = new Date();
    const hoursSince = (now.getTime() - lastTaken.getTime()) / (1000 * 60 * 60);
    
    if (hoursSince < 4) {
      const nextDose = new Date(lastTaken.getTime() + 4 * 60 * 60 * 1000);
      const hoursUntil = Math.ceil((nextDose.getTime() - now.getTime()) / (1000 * 60 * 60));
      return `Next dose in ${hoursUntil} hours`;
    }
    
    return "Ready to take";
  };

  if (!primaryMedication) {
    return (
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold mb-3">Medication Schedule</h2>
        <Card className="p-4">
          <CardContent className="p-0 text-center text-muted-foreground">
            <p>No medications configured.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 border-b border-border">
      <h2 className="text-lg font-semibold mb-3">Medication Schedule</h2>
      
      <Card className="bg-gradient-to-r from-medical-success/10 to-medical-success/5 border-medical-success/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-medical-success rounded-full flex items-center justify-center">
                <Pill className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="font-semibold">
                  {primaryMedication.name} {primaryMedication.dosage}
                </div>
                <div className="text-sm text-muted-foreground">
                  {getNextDoseTime()}
                </div>
              </div>
            </div>
            <Button 
              className="bg-medical-success hover:bg-medical-success/90"
              onClick={() => logMedicationMutation.mutate(primaryMedication.id)}
              disabled={logMedicationMutation.isPending}
            >
              {logMedicationMutation.isPending ? "Logging..." : "Mark Taken"}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Medication effectiveness */}
      {effectiveness && (
        <Card className="mt-3">
          <CardContent className="p-3">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Recent Effectiveness</span>
              <span className="font-semibold medical-success">
                {effectiveness.effectiveness}% effective
              </span>
            </div>
            <Progress 
              value={effectiveness.effectiveness} 
              className="h-2"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
