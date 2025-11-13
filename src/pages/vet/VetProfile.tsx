import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Stethoscope } from "lucide-react";

const VetProfile = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [vetProfile, setVetProfile] = useState({
    license_number: "",
    specialization: "",
    clinic_name: "",
    clinic_address: "",
    years_of_experience: 0,
    available_hours_start: "09:00",
    available_hours_end: "17:00",
    available_days: [] as string[],
  });

  useEffect(() => {
    if (user) {
      fetchVetProfile();
    }
  }, [user]);

  const fetchVetProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("vet_profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setVetProfile(data);
      }
    } catch (error) {
      console.error("Error fetching vet profile:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from("vet_profiles")
        .upsert({
          id: user?.id,
          ...vetProfile,
        });

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const toggleDay = (day: string) => {
    setVetProfile(prev => ({
      ...prev,
      available_days: prev.available_days.includes(day)
        ? prev.available_days.filter(d => d !== day)
        : [...prev.available_days, day]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-hero p-6">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/vet/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <Stethoscope className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Veterinarian Profile</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={profile?.full_name || ""}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={profile?.email || ""}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={profile?.phone || ""}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="license_number">License Number *</Label>
                <Input
                  id="license_number"
                  value={vetProfile.license_number}
                  onChange={(e) => setVetProfile({ ...vetProfile, license_number: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization *</Label>
                <Input
                  id="specialization"
                  value={vetProfile.specialization}
                  onChange={(e) => setVetProfile({ ...vetProfile, specialization: e.target.value })}
                  required
                  placeholder="e.g., Small Animals, Surgery, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="years_of_experience">Years of Experience</Label>
                <Input
                  id="years_of_experience"
                  type="number"
                  value={vetProfile.years_of_experience}
                  onChange={(e) => setVetProfile({ ...vetProfile, years_of_experience: parseInt(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clinic_name">Clinic Name</Label>
                <Input
                  id="clinic_name"
                  value={vetProfile.clinic_name || ""}
                  onChange={(e) => setVetProfile({ ...vetProfile, clinic_name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clinic_address">Clinic Address</Label>
                <Textarea
                  id="clinic_address"
                  value={vetProfile.clinic_address || ""}
                  onChange={(e) => setVetProfile({ ...vetProfile, clinic_address: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="available_hours_start">Available From</Label>
                <Input
                  id="available_hours_start"
                  type="time"
                  value={vetProfile.available_hours_start || "09:00"}
                  onChange={(e) => setVetProfile({ ...vetProfile, available_hours_start: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="available_hours_end">Available Until</Label>
                <Input
                  id="available_hours_end"
                  type="time"
                  value={vetProfile.available_hours_end || "17:00"}
                  onChange={(e) => setVetProfile({ ...vetProfile, available_hours_end: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Available Days</Label>
              <div className="flex flex-wrap gap-2">
                {weekDays.map(day => (
                  <Button
                    key={day}
                    type="button"
                    variant={vetProfile.available_days.includes(day) ? "default" : "outline"}
                    onClick={() => toggleDay(day)}
                  >
                    {day}
                  </Button>
                ))}
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Saving..." : "Save Profile"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default VetProfile;
