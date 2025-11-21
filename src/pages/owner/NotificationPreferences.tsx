import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Bell, Send } from "lucide-react";

export default function NotificationPreferences() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [preferredMethod, setPreferredMethod] = useState<string>("phone");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (!user || profile?.role !== "pet_owner") {
      navigate("/owner/login");
      return;
    }
    fetchPreferences();
  }, [user, profile, navigate]);

  const fetchPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from("pet_owner_profiles")
        .select("preferred_contact_method")
        .eq("id", user?.id)
        .single();

      if (error) throw error;
      
      if (data?.preferred_contact_method) {
        setPreferredMethod(data.preferred_contact_method);
      }
    } catch (error) {
      console.error("Error fetching preferences:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("pet_owner_profiles")
        .update({ preferred_contact_method: preferredMethod })
        .eq("id", user?.id);

      if (error) throw error;

      toast({
        title: "Preferences Updated",
        description: "Your notification preferences have been saved successfully.",
      });
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTestNotification = async () => {
    setTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-test-notification', {
        body: {
          userId: user?.id,
          preferredMethod: preferredMethod
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Test Notification Sent! 🎉",
          description: data.message,
        });
      } else {
        toast({
          title: "Test Failed",
          description: data?.message || "Failed to send test notification.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error sending test notification:", error);
      toast({
        title: "Error",
        description: "Failed to send test notification. Please try again.",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Loading preferences...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 p-4">
      <div className="max-w-2xl mx-auto py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/owner/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Bell className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose how you'd like to receive appointment reminders and confirmations
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label className="text-base font-semibold">Preferred Contact Method</Label>
              <RadioGroup value={preferredMethod} onValueChange={setPreferredMethod}>
                <div className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-accent/50 transition-colors">
                  <RadioGroupItem value="phone" id="phone" />
                  <Label htmlFor="phone" className="flex-1 cursor-pointer">
                    <div className="font-medium">SMS Only</div>
                    <div className="text-sm text-muted-foreground">
                      Receive reminders via text message to your phone
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-accent/50 transition-colors">
                  <RadioGroupItem value="email" id="email" />
                  <Label htmlFor="email" className="flex-1 cursor-pointer">
                    <div className="font-medium">Email Only</div>
                    <div className="text-sm text-muted-foreground">
                      Receive reminders via email
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-accent/50 transition-colors">
                  <RadioGroupItem value="both" id="both" />
                  <Label htmlFor="both" className="flex-1 cursor-pointer">
                    <div className="font-medium">Both SMS and Email</div>
                    <div className="text-sm text-muted-foreground">
                      Receive reminders via both text message and email
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="pt-4 space-y-3">
              <Button 
                onClick={handleSave} 
                disabled={saving}
                className="w-full"
              >
                {saving ? "Saving..." : "Save Preferences"}
              </Button>
              
              <Button 
                onClick={handleTestNotification} 
                disabled={testing || !preferredMethod}
                variant="outline"
                className="w-full"
              >
                <Send className="mr-2 h-4 w-4" />
                {testing ? "Sending Test..." : "Send Test Notification"}
              </Button>
            </div>

            <div className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
              <p className="font-medium mb-2">Test Your Notifications:</p>
              <p className="mb-2">
                Click "Send Test Notification" to verify your contact preferences are working correctly. 
                You'll receive a test message via your selected method(s).
              </p>
            </div>

            <div className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
              <p className="font-medium mb-2">About Notifications:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Appointment reminders are sent 24 hours before your scheduled appointment</li>
                <li>You'll receive a confirmation immediately after booking</li>
                <li>Reminders are sent daily at 9 AM for next-day appointments</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
