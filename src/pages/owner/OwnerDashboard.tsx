import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, User, LogOut, Plus, Stethoscope, UserCircle, PawPrint, FileText, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import ChatBot from "@/components/ChatBot";

interface Vet {
  id: string;
  full_name: string;
  vet_profiles: {
    specialization: string;
    clinic_name: string | null;
  };
}

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  pet_name: string;
  pet_type: string;
  reason: string;
  status: string;
  profiles: {
    full_name: string;
  };
}

const OwnerDashboard = () => {
  const { profile, loading: authLoading, signOut } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [vets, setVets] = useState<Vet[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    vetId: "",
    petName: "",
    petType: "",
    appointmentDate: "",
    appointmentTime: "",
    reason: "",
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading) {
      if (!profile || profile.role !== "pet_owner") {
        navigate("/owner/login");
      } else {
        fetchData();
      }
    }
  }, [profile, authLoading, navigate]);

  const fetchData = async () => {
    try {
      const [appointmentsResult, vetsResult] = await Promise.all([
        supabase
          .from("appointments")
          .select(`
            *,
            profiles!appointments_vet_id_fkey(full_name)
          `)
          .eq("pet_owner_id", profile?.id)
          .order("appointment_date", { ascending: true })
          .order("appointment_time", { ascending: true }),
        supabase
          .from("profiles")
          .select(`
            id,
            full_name,
            vet_profiles(specialization, clinic_name)
          `)
          .eq("role", "vet")
          .not("vet_profiles", "is", null),
      ]);

      if (appointmentsResult.error) throw appointmentsResult.error;
      if (vetsResult.error) throw vetsResult.error;

      setAppointments(appointmentsResult.data || []);
      setVets(vetsResult.data || []);
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

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase.from("appointments").insert({
        vet_id: formData.vetId,
        pet_owner_id: profile?.id,
        appointment_date: formData.appointmentDate,
        appointment_time: formData.appointmentTime,
        pet_name: formData.petName,
        pet_type: formData.petType,
        reason: formData.reason,
        status: "pending",
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Appointment booked successfully",
      });

      setDialogOpen(false);
      setFormData({
        vetId: "",
        petName: "",
        petType: "",
        appointmentDate: "",
        appointmentTime: "",
        reason: "",
      });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <header className="bg-card shadow-soft border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Pet Owner Dashboard</h1>
            <p className="text-muted-foreground">Welcome, {profile?.full_name}</p>
          </div>
          <div className="flex items-center gap-4">
            <Button asChild variant="outline">
              <Link to="/owner/profile">
                <UserCircle className="w-4 h-4 mr-2" />
                Profile
              </Link>
            </Button>
            <Button variant="outline" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>
      
      <ChatBot />

      <main className="container mx-auto px-4 py-8">
        {/* Quick Links */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Button asChild variant="outline" className="h-24 flex-col gap-2">
            <Link to="/owner/pet-profile">
              <PawPrint className="w-6 h-6" />
              <span>Pet Profile</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-24 flex-col gap-2">
            <Link to="/owner/health-records">
              <FileText className="w-6 h-6" />
              <span>Health Records</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-24 flex-col gap-2">
            <Link to="/owner/resources">
              <BookOpen className="w-6 h-6" />
              <span>Resources</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-24 flex-col gap-2">
            <Link to="/owner/dashboard">
              <Calendar className="w-6 h-6" />
              <span>Calendar</span>
            </Link>
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Upcoming</p>
                <p className="text-2xl font-bold text-foreground">
                  {appointments.filter(a => new Date(a.appointment_date) >= new Date()).length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <User className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Appointments</p>
                <p className="text-2xl font-bold text-foreground">{appointments.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Available Vets</p>
                <p className="text-2xl font-bold text-foreground">{vets.length}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-foreground">My Appointments</h2>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-secondary">
                <Plus className="w-4 h-4 mr-2" />
                Book Appointment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Book New Appointment</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleBookAppointment} className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Veterinarian *</Label>
                  <Select value={formData.vetId} onValueChange={(value) => setFormData({...formData, vetId: value})} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a vet" />
                    </SelectTrigger>
                    <SelectContent>
                      {vets.map((vet) => (
                        <SelectItem key={vet.id} value={vet.id}>
                          {vet.full_name} - {vet.vet_profiles?.specialization}
                          {vet.vet_profiles?.clinic_name && ` (${vet.vet_profiles.clinic_name})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Pet Name *</Label>
                    <Input
                      value={formData.petName}
                      onChange={(e) => setFormData({...formData, petName: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Pet Type *</Label>
                    <Select value={formData.petType} onValueChange={(value) => setFormData({...formData, petType: value})} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Dog">Dog</SelectItem>
                        <SelectItem value="Cat">Cat</SelectItem>
                        <SelectItem value="Bird">Bird</SelectItem>
                        <SelectItem value="Rabbit">Rabbit</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date *</Label>
                    <Input
                      type="date"
                      min={format(new Date(), "yyyy-MM-dd")}
                      value={formData.appointmentDate}
                      onChange={(e) => setFormData({...formData, appointmentDate: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Time *</Label>
                    <Input
                      type="time"
                      value={formData.appointmentTime}
                      onChange={(e) => setFormData({...formData, appointmentTime: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Reason for Visit *</Label>
                  <Textarea
                    value={formData.reason}
                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                    placeholder="Describe the reason for this appointment..."
                    required
                  />
                </div>

                <Button type="submit" className="w-full bg-gradient-secondary">
                  Book Appointment
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="p-6">
          {appointments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No appointments yet. Book your first appointment!</p>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <Card key={appointment.id} className="p-4 border-2">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(appointment.appointment_date), "PPP")}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          {appointment.appointment_time}
                        </div>
                      </div>
                      
                      <div>
                        <p className="font-semibold text-foreground">
                          Pet: {appointment.pet_name} ({appointment.pet_type})
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Vet: Dr. {appointment.profiles.full_name}
                        </p>
                      </div>
                      
                      <p className="text-sm text-foreground">
                        <span className="font-medium">Reason:</span> {appointment.reason}
                      </p>
                      
                      <div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          appointment.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                          appointment.status === "confirmed" ? "bg-green-100 text-green-800" :
                          appointment.status === "completed" ? "bg-blue-100 text-blue-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                          {appointment.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>
      </main>
    </div>
  );
};

export default OwnerDashboard;
