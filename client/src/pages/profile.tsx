import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BottomNavigation } from "@/components/bottom-navigation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  ArrowLeft, 
  User, 
  Settings, 
  Bell, 
  Shield, 
  Moon, 
  Sun, 
  Monitor,
  LogOut,
  Activity,
  Calendar,
  Pill,
  FileText
} from "lucide-react";
import { useLocation } from "wouter";
import { useTheme } from "@/components/theme-provider";

export default function Profile() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: weeklyStats } = useQuery({
    queryKey: ["/api/analytics/weekly"],
    retry: false,
  });

  const { data: medications } = useQuery({
    queryKey: ["/api/medications"],
    retry: false,
  });

  const { data: episodes } = useQuery({
    queryKey: ["/api/episodes", { limit: 10 }],
    retry: false,
  });

  const { data: reports } = useQuery({
    queryKey: ["/api/reports"],
    retry: false,
  });

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return "U";
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto bg-background min-h-screen">
        <div className="p-4">
          <div className="animate-pulse space-y-4">
            <div className="h-16 bg-muted rounded-lg"></div>
            <div className="h-32 bg-muted rounded-lg"></div>
            <div className="h-24 bg-muted rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

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
            <div className="text-xs opacity-75">TechNeurology</div>
            <h1 className="text-lg font-semibold">Profile</h1>
            <p className="text-sm opacity-90">Manage your account & settings</p>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* User Profile Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user?.profileImageUrl || ""} />
                <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                  {getInitials(user?.firstName, user?.lastName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-xl font-semibold">
                  {user?.firstName || user?.lastName 
                    ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                    : "User"
                  }
                </h2>
                <p className="text-muted-foreground">{user?.email || "No email provided"}</p>
                <Badge variant="secondary" className="mt-1">
                  Member since {formatDate(user?.createdAt)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Your Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold medical-error">
                  {weeklyStats?.episodeCount || 0}
                </div>
                <div className="text-xs text-muted-foreground">Episodes This Week</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold medical-success">
                  {medications?.length || 0}
                </div>
                <div className="text-xs text-muted-foreground">Active Medications</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold medical-warning">
                  {episodes?.length || 0}
                </div>
                <div className="text-xs text-muted-foreground">Total Episodes</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {reports?.length || 0}
                </div>
                <div className="text-xs text-muted-foreground">Medical Reports</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Theme Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Appearance</span>
            </CardTitle>
            <CardDescription>
              Adjust display settings for light sensitivity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Theme</span>
                <div className="flex items-center space-x-1">
                  <Button
                    variant={theme === "light" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("light")}
                  >
                    <Sun className="h-4 w-4 mr-1" />
                    Light
                  </Button>
                  <Button
                    variant={theme === "dark" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("dark")}
                  >
                    <Moon className="h-4 w-4 mr-1" />
                    Dark
                  </Button>
                  <Button
                    variant={theme === "system" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("system")}
                  >
                    <Monitor className="h-4 w-4 mr-1" />
                    Auto
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* App Features */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Access</CardTitle>
            <CardDescription>
              Navigate to key features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => setLocation("/tracking")}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Episode Tracking
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => setLocation("/medication")}
            >
              <Pill className="h-4 w-4 mr-2" />
              Medications
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => setLocation("/reports")}
            >
              <FileText className="h-4 w-4 mr-2" />
              Medical Reports
            </Button>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Account</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => toast({ title: "Privacy Settings", description: "Feature coming soon" })}
            >
              <Shield className="h-4 w-4 mr-2" />
              Privacy & Security
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => toast({ title: "Notifications", description: "Feature coming soon" })}
            >
              <Bell className="h-4 w-4 mr-2" />
              Notification Settings
            </Button>
            
            <Separator />
            
            <Button
              variant="destructive"
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>

        {/* Medical Disclaimer */}
        <Card className="border-medical-warning/20 bg-medical-warning/5">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground space-y-2">
              <p className="font-medium text-foreground">Medical Disclaimer</p>
              <p>
                NeuroRelief is designed to help you track and manage your migraine patterns. 
                This app is not a substitute for professional medical advice, diagnosis, or treatment.
              </p>
              <p>
                Always consult with your healthcare provider regarding any questions or concerns 
                about your medical condition.
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
