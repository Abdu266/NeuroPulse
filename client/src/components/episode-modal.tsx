import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const episodeSchema = z.object({
  intensity: z.number().min(1).max(10),
  symptoms: z.array(z.string()).default([]),
  triggers: z.array(z.string()).default([]),
  notes: z.string().optional(),
  isEmergency: z.boolean().default(false),
});

type EpisodeFormData = z.infer<typeof episodeSchema>;

interface EpisodeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEmergency?: boolean;
}

const SYMPTOMS = [
  "Nausea",
  "Light Sensitivity", 
  "Sound Sensitivity",
  "Aura",
  "Vomiting",
  "Dizziness",
  "Neck Pain",
  "Fatigue",
];

const TRIGGERS = [
  { value: "stress", label: "Stress" },
  { value: "sleep", label: "Poor Sleep" },
  { value: "weather", label: "Weather Change" },
  { value: "food", label: "Food/Drink" },
  { value: "hormones", label: "Hormonal" },
  { value: "light", label: "Bright Light" },
  { value: "sound", label: "Loud Sound" },
  { value: "other", label: "Other" },
];

export function EpisodeModal({ open, onOpenChange, isEmergency = false }: EpisodeModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<EpisodeFormData>({
    resolver: zodResolver(episodeSchema),
    defaultValues: {
      intensity: isEmergency ? 8 : 5,
      symptoms: [],
      triggers: [],
      notes: "",
      isEmergency,
    },
  });

  const createEpisodeMutation = useMutation({
    mutationFn: async (data: EpisodeFormData) => {
      return apiRequest("POST", "/api/episodes", {
        ...data,
        startTime: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/episodes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/weekly"] });
      toast({
        title: "Episode logged",
        description: "Your migraine episode has been recorded successfully.",
      });
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to log episode. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EpisodeFormData) => {
    createEpisodeMutation.mutate(data);
  };

  const intensityValue = form.watch("intensity");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEmergency ? "Log Emergency Episode" : "Log Episode"}
          </DialogTitle>
          <DialogDescription>
            Record your migraine symptoms and triggers for tracking.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Pain Intensity */}
            <FormField
              control={form.control}
              name="intensity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pain Intensity: {intensityValue}/10</FormLabel>
                  <FormControl>
                    <div className="px-2">
                      <Slider
                        min={1}
                        max={10}
                        step={1}
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>1 - Mild</span>
                        <span>10 - Severe</span>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Symptoms */}
            <FormField
              control={form.control}
              name="symptoms"
              render={() => (
                <FormItem>
                  <FormLabel>Symptoms</FormLabel>
                  <div className="grid grid-cols-2 gap-2">
                    {SYMPTOMS.map((symptom) => (
                      <FormField
                        key={symptom}
                        control={form.control}
                        name="symptoms"
                        render={({ field }) => (
                          <FormItem
                            key={symptom}
                            className="flex flex-row items-start space-x-2 space-y-0 p-2 border rounded-md hover:bg-muted/50 cursor-pointer"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(symptom)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, symptom])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== symptom
                                        )
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal cursor-pointer">
                              {symptom}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Triggers */}
            <FormField
              control={form.control}
              name="triggers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Possible Triggers</FormLabel>
                  <div className="grid grid-cols-2 gap-2">
                    {TRIGGERS.map((trigger) => (
                      <FormItem
                        key={trigger.value}
                        className="flex flex-row items-start space-x-2 space-y-0 p-2 border rounded-md hover:bg-muted/50 cursor-pointer"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(trigger.value)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...field.value, trigger.value])
                                : field.onChange(
                                    field.value?.filter(
                                      (value) => value !== trigger.value
                                    )
                                  );
                            }}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal cursor-pointer">
                          {trigger.label}
                        </FormLabel>
                      </FormItem>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional details..."
                      className="resize-none h-20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={createEpisodeMutation.isPending}
              >
                {createEpisodeMutation.isPending ? "Saving..." : "Save Episode"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
