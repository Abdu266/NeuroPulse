import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Plus, Activity, Heart, Thermometer, FileText, Clipboard, AlertCircle, User, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { insertMedicalLogSchema, type MedicalLog } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

const medicalLogFormSchema = insertMedicalLogSchema.extend({
  symptoms: z.array(z.string()).default([]),
  associatedSymptoms: z.array(z.string()).default([]),
  triggers: z.array(z.string()).default([]),
  environmentalFactors: z.array(z.string()).default([]),
  vitalSigns: z.object({
    bloodPressure: z.string().optional(),
    heartRate: z.number().optional(),
    temperature: z.number().optional(),
  }).optional(),
});

type MedicalLogForm = z.infer<typeof medicalLogFormSchema>;

const commonSymptoms = [
  'Throbbing pain', 'Sharp pain', 'Dull ache', 'Burning sensation',
  'Nausea', 'Vomiting', 'Light sensitivity', 'Sound sensitivity',
  'Dizziness', 'Fatigue', 'Blurred vision', 'Neck stiffness',
  'Muscle tension', 'Difficulty concentrating', 'Mood changes'
];

const commonTriggers = [
  'Stress', 'Lack of sleep', 'Dehydration', 'Bright lights',
  'Loud noises', 'Strong smells', 'Weather changes', 'Hormonal changes',
  'Certain foods', 'Alcohol', 'Caffeine', 'Screen time',
  'Physical activity', 'Emotional stress', 'Medication changes'
];

const painLocations = [
  'Frontal', 'Temporal', 'Occipital', 'Parietal', 'Behind eyes',
  'Neck', 'Jaw', 'Sinus area', 'Entire head', 'One side', 'Both sides'
];

const painQualities = [
  'Throbbing', 'Sharp', 'Dull', 'Burning', 'Stabbing',
  'Pulsing', 'Pressure', 'Squeezing', 'Tight', 'Piercing'
];

const logTypes = [
  { value: 'assessment', label: 'General Assessment' },
  { value: 'vitals', label: 'Vital Signs' },
  { value: 'symptoms', label: 'Symptom Tracking' },
  { value: 'medication_effect', label: 'Medication Effect' },
  { value: 'treatment', label: 'Treatment Response' },
];

export default function Medical() {
  const [isLogDialogOpen, setIsLogDialogOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<MedicalLog | null>(null);
  const [activeTab, setActiveTab] = useState('recent');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: medicalLogs, isLoading } = useQuery({
    queryKey: ['/api/medical-logs'],
    retry: false,
  });

  const { data: episodes } = useQuery({
    queryKey: ['/api/episodes'],
    retry: false,
  });

  const form = useForm<MedicalLogForm>({
    resolver: zodResolver(medicalLogFormSchema),
    defaultValues: {
      logType: 'assessment',
      severity: 5,
      symptoms: [],
      associatedSymptoms: [],
      triggers: [],
      environmentalFactors: [],
      functionalImpact: 5,
      medicationResponse: 5,
      notes: '',
    },
  });

  const createLogMutation = useMutation({
    mutationFn: async (data: MedicalLogForm) => {
      return await apiRequest('/api/medical-logs', 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/medical-logs'] });
      setIsLogDialogOpen(false);
      form.reset();
      toast({
        title: "Medical log created",
        description: "Your medical log has been saved successfully.",
      });
    },
    onError: (error) => {
      console.error('Error creating medical log:', error);
      toast({
        title: "Error",
        description: "Failed to create medical log. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: MedicalLogForm) => {
    createLogMutation.mutate(data);
  };

  const getSeverityColor = (severity: number) => {
    if (severity <= 3) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    if (severity <= 6) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
  };

  const getLogTypeIcon = (logType: string) => {
    switch (logType) {
      case 'vitals': return <Heart className="w-4 h-4" />;
      case 'symptoms': return <Activity className="w-4 h-4" />;
      case 'medication_effect': return <FileText className="w-4 h-4" />;
      case 'treatment': return <Clipboard className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const formatLogTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return format(date, 'MMM d, yyyy h:mm a');
  };

  const recentLogs = medicalLogs?.slice(0, 10) || [];
  const symptomLogs = medicalLogs?.filter((log: MedicalLog) => log.logType === 'symptoms') || [];
  const vitalLogs = medicalLogs?.filter((log: MedicalLog) => log.logType === 'vitals') || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4 pb-20">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-primary mb-1">TechNeurology</div>
            <h1 className="text-3xl font-bold text-foreground">Medical Logs</h1>
            <p className="text-muted-foreground mt-1">
              Comprehensive medical tracking and assessment
            </p>
          </div>
          <Dialog open={isLogDialogOpen} onOpenChange={setIsLogDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                New Log
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Medical Log</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="logType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Log Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select log type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {logTypes.map(type => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="episodeId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Associated Episode (Optional)</FormLabel>
                          <Select onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select episode" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {episodes?.map((episode: any) => (
                                <SelectItem key={episode.id} value={episode.id.toString()}>
                                  {format(new Date(episode.startTime), 'MMM d, yyyy')} - Intensity {episode.intensity}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="severity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Severity (1-10)</FormLabel>
                        <div className="px-3">
                          <Slider
                            min={1}
                            max={10}
                            step={1}
                            value={[field.value || 5]}
                            onValueChange={(value) => field.onChange(value[0])}
                            className="w-full"
                          />
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Mild</span>
                          <span className="font-medium">{field.value || 5}</span>
                          <span>Severe</span>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="painLocation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pain Location</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select location" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {painLocations.map(location => (
                                <SelectItem key={location} value={location}>
                                  {location}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="painQuality"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pain Quality</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select quality" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {painQualities.map(quality => (
                                <SelectItem key={quality} value={quality}>
                                  {quality}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="symptoms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Symptoms</FormLabel>
                        <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                          {commonSymptoms.map((symptom) => (
                            <div key={symptom} className="flex items-center space-x-2">
                              <Checkbox
                                id={symptom}
                                checked={field.value?.includes(symptom)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange([...field.value, symptom]);
                                  } else {
                                    field.onChange(field.value?.filter(s => s !== symptom));
                                  }
                                }}
                              />
                              <label
                                htmlFor={symptom}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {symptom}
                              </label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="triggers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Triggers</FormLabel>
                        <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                          {commonTriggers.map((trigger) => (
                            <div key={trigger} className="flex items-center space-x-2">
                              <Checkbox
                                id={trigger}
                                checked={field.value?.includes(trigger)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange([...field.value, trigger]);
                                  } else {
                                    field.onChange(field.value?.filter(t => t !== trigger));
                                  }
                                }}
                              />
                              <label
                                htmlFor={trigger}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {trigger}
                              </label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="functionalImpact"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Functional Impact (1-10)</FormLabel>
                          <div className="px-3">
                            <Slider
                              min={1}
                              max={10}
                              step={1}
                              value={[field.value || 5]}
                              onValueChange={(value) => field.onChange(value[0])}
                              className="w-full"
                            />
                          </div>
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>No impact</span>
                            <span className="font-medium">{field.value || 5}</span>
                            <span>Severe impact</span>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="medicationResponse"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Medication Response (1-10)</FormLabel>
                          <div className="px-3">
                            <Slider
                              min={1}
                              max={10}
                              step={1}
                              value={[field.value || 5]}
                              onValueChange={(value) => field.onChange(value[0])}
                              className="w-full"
                            />
                          </div>
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>No effect</span>
                            <span className="font-medium">{field.value || 5}</span>
                            <span>Very effective</span>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Additional notes about this log entry..."
                            className="resize-none"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsLogDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createLogMutation.isPending}>
                      {createLogMutation.isPending ? 'Creating...' : 'Create Log'}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Medical Logs Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="symptoms">Symptoms</TabsTrigger>
            <TabsTrigger value="vitals">Vitals</TabsTrigger>
            <TabsTrigger value="all">All Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="recent" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Medical Logs</CardTitle>
                <CardDescription>Your most recent medical assessments and logs</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">Loading medical logs...</div>
                ) : recentLogs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No medical logs found.</p>
                    <p className="text-sm mt-2">Create your first log to start tracking your health.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentLogs.map((log: MedicalLog) => (
                      <div key={log.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {getLogTypeIcon(log.logType)}
                            <span className="font-medium capitalize">{log.logType.replace('_', ' ')}</span>
                            {log.severity && (
                              <Badge className={getSeverityColor(log.severity)}>
                                Severity {log.severity}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>{formatLogTime(log.timestamp)}</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          {log.painLocation && (
                            <div>
                              <span className="font-medium">Location:</span> {log.painLocation}
                            </div>
                          )}
                          {log.painQuality && (
                            <div>
                              <span className="font-medium">Quality:</span> {log.painQuality}
                            </div>
                          )}
                          {log.functionalImpact && (
                            <div>
                              <span className="font-medium">Functional Impact:</span> {log.functionalImpact}/10
                            </div>
                          )}
                          {log.medicationResponse && (
                            <div>
                              <span className="font-medium">Medication Response:</span> {log.medicationResponse}/10
                            </div>
                          )}
                        </div>

                        {log.symptoms && log.symptoms.length > 0 && (
                          <div className="mt-3">
                            <span className="font-medium text-sm">Symptoms:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {log.symptoms.map((symptom, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {symptom}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {log.notes && (
                          <div className="mt-3 p-3 bg-muted/50 rounded-md">
                            <p className="text-sm">{log.notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="symptoms" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Symptom Tracking</CardTitle>
                <CardDescription>Track and analyze your symptoms over time</CardDescription>
              </CardHeader>
              <CardContent>
                {symptomLogs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No symptom logs found.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {symptomLogs.map((log: MedicalLog) => (
                      <div key={log.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Badge className={getSeverityColor(log.severity || 5)}>
                            Severity {log.severity}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {formatLogTime(log.timestamp)}
                          </span>
                        </div>
                        
                        {log.symptoms && log.symptoms.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {log.symptoms.map((symptom, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {symptom}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vitals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Vital Signs</CardTitle>
                <CardDescription>Monitor your vital signs and health metrics</CardDescription>
              </CardHeader>
              <CardContent>
                {vitalLogs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No vital signs logged.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {vitalLogs.map((log: MedicalLog) => (
                      <div key={log.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Heart className="w-4 h-4 text-red-500" />
                            <span className="font-medium">Vital Signs</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {formatLogTime(log.timestamp)}
                          </span>
                        </div>
                        
                        {log.vitalSigns && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            {log.vitalSigns.bloodPressure && (
                              <div>
                                <span className="font-medium">Blood Pressure:</span> {log.vitalSigns.bloodPressure}
                              </div>
                            )}
                            {log.vitalSigns.heartRate && (
                              <div>
                                <span className="font-medium">Heart Rate:</span> {log.vitalSigns.heartRate} bpm
                              </div>
                            )}
                            {log.vitalSigns.temperature && (
                              <div>
                                <span className="font-medium">Temperature:</span> {log.vitalSigns.temperature}°F
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Medical Logs</CardTitle>
                <CardDescription>Complete history of your medical logs</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">Loading medical logs...</div>
                ) : !medicalLogs || medicalLogs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No medical logs found.</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[600px] pr-4">
                    <div className="space-y-4">
                      {medicalLogs.map((log: MedicalLog) => (
                        <div key={log.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              {getLogTypeIcon(log.logType)}
                              <span className="font-medium capitalize">{log.logType.replace('_', ' ')}</span>
                              {log.severity && (
                                <Badge className={getSeverityColor(log.severity)}>
                                  Severity {log.severity}
                                </Badge>
                              )}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {formatLogTime(log.timestamp)}
                            </span>
                          </div>
                          
                          <div className="text-sm text-muted-foreground">
                            {log.painLocation && `${log.painLocation} • `}
                            {log.painQuality && `${log.painQuality} • `}
                            {log.functionalImpact && `Impact: ${log.functionalImpact}/10`}
                          </div>

                          {log.symptoms && log.symptoms.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {log.symptoms.slice(0, 3).map((symptom, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {symptom}
                                </Badge>
                              ))}
                              {log.symptoms.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{log.symptoms.length - 3} more
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}