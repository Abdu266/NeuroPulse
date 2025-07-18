import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BottomNavigation } from "@/components/bottom-navigation";
import { ArrowLeft, Download, FileText, Calendar } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Reports() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: reports, isLoading } = useQuery({
    queryKey: ["/api/reports"],
  });

  const generateReportMutation = useMutation({
    mutationFn: async (params: { startDate: string; endDate: string; reportType: string }) => {
      return apiRequest("POST", "/api/reports/generate", params);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      toast({
        title: "Report generated",
        description: "Your medical report has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    },
  });

  const generateWeeklyReport = () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    
    generateReportMutation.mutate({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      reportType: 'weekly'
    });
  };

  const generateMonthlyReport = () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);
    
    generateReportMutation.mutate({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      reportType: 'monthly'
    });
  };

  const downloadReport = (report: any) => {
    // In a real app, this would generate and download a PDF
    const reportContent = JSON.stringify(report.reportData, null, 2);
    const blob = new Blob([reportContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `migraine-report-${report.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getReportTypeColor = (type: string) => {
    switch (type) {
      case 'weekly': return 'bg-medical-success';
      case 'monthly': return 'bg-medical-warning';
      default: return 'bg-primary';
    }
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
            <h1 className="text-lg font-semibold">Medical Reports</h1>
            <p className="text-sm opacity-90">Generate reports for your doctor</p>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Generate New Report</CardTitle>
            <CardDescription>
              Create comprehensive reports for your healthcare provider
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={generateWeeklyReport}
              disabled={generateReportMutation.isPending}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Weekly Report (Last 7 Days)
            </Button>
            
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={generateMonthlyReport}
              disabled={generateReportMutation.isPending}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Monthly Report (Last 30 Days)
            </Button>
            
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => toast({ title: "Custom Report", description: "Feature coming soon" })}
            >
              <FileText className="h-4 w-4 mr-2" />
              Custom Date Range
            </Button>
          </CardContent>
        </Card>

        {/* Generated Reports */}
        <Card>
          <CardHeader>
            <CardTitle>Your Reports</CardTitle>
            <CardDescription>
              Previously generated medical reports
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
            ) : reports?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No reports generated yet.</p>
                <p className="text-sm mt-1">Generate your first report above.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reports?.map((report) => (
                  <Card key={report.id} className="p-4">
                    <CardContent className="p-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge className={getReportTypeColor(report.reportType)}>
                              {report.reportType.charAt(0).toUpperCase() + report.reportType.slice(1)} Report
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-1">
                            {formatDate(report.startDate)} - {formatDate(report.endDate)}
                          </p>
                          
                          <p className="text-xs text-muted-foreground">
                            Generated: {formatDate(report.generatedAt)}
                          </p>
                          
                          {/* Report Summary */}
                          {report.reportData?.summary && (
                            <div className="mt-3 p-2 bg-muted/50 rounded text-xs">
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <span className="font-medium">Episodes: </span>
                                  {report.reportData.summary.totalEpisodes}
                                </div>
                                <div>
                                  <span className="font-medium">Avg Intensity: </span>
                                  {Math.round(report.reportData.summary.avgIntensity * 10) / 10}/10
                                </div>
                                <div>
                                  <span className="font-medium">Medications: </span>
                                  {report.reportData.summary.totalMedications}
                                </div>
                                <div>
                                  <span className="font-medium">Top Triggers: </span>
                                  {report.reportData.summary.mostCommonTriggers?.slice(0, 2).join(', ') || 'None'}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadReport(report)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Report Information */}
        <Card>
          <CardHeader>
            <CardTitle>About Medical Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                These reports are designed to help you communicate effectively with your healthcare provider.
              </p>
              
              <div className="space-y-2">
                <h4 className="font-medium text-foreground">Reports include:</h4>
                <ul className="space-y-1 ml-4">
                  <li>• Episode frequency and intensity patterns</li>
                  <li>• Medication usage and effectiveness</li>
                  <li>• Trigger correlation analysis</li>
                  <li>• Symptom tracking over time</li>
                </ul>
              </div>
              
              <p className="text-xs">
                Note: Always discuss these reports with your healthcare provider. 
                This app is not a substitute for professional medical advice.
              </p>
            </div>
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
