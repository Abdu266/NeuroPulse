import { Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-8">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
            <Brain className="h-8 w-8 text-primary-foreground" />
          </div>
          <div className="text-sm font-medium text-primary mb-2">TechNeurology</div>
          <CardTitle className="text-2xl font-bold">Welcome to NeuroRelief</CardTitle>
          <CardDescription className="text-base">
            Your comprehensive migraine management companion. Track episodes, monitor patterns, 
            and manage your care with medical-grade precision.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-medical-success rounded-full mt-2"></div>
              <div>
                <h3 className="font-semibold">Episode Tracking</h3>
                <p className="text-sm text-muted-foreground">
                  Log and track your migraine episodes with detailed symptom analysis
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-medical-warning rounded-full mt-2"></div>
              <div>
                <h3 className="font-semibold">Smart Analytics</h3>
                <p className="text-sm text-muted-foreground">
                  Discover triggers and patterns with AI-powered insights
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <div>
                <h3 className="font-semibold">Medical Reports</h3>
                <p className="text-sm text-muted-foreground">
                  Generate comprehensive reports for your healthcare provider
                </p>
              </div>
            </div>
          </div>
          
          <Button 
            className="w-full bg-primary hover:bg-primary/90" 
            size="lg"
            onClick={() => window.location.href = "/api/login"}
          >
            Get Started
          </Button>
          
          <p className="text-xs text-center text-muted-foreground">
            Secure authentication powered by industry-standard protocols
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
