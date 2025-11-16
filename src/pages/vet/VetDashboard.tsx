import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, Clock, User, LogOut, Phone, UserCircle, Video, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import ChatBot from "@/components/ChatBot";

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  pet_name: string;
  pet_type: string;
  reason: string;
  status: string;
  pet_owner_id: string;
  profiles: {
    full_name: string;
    phone: string;
  };
}

const VetDashboard = () => {
  const { profile, loading: authLoading, signOut } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading) {
      if (!profile || profile.role !== "vet") {
        navigate("/vet/login");
      } else {
        fetchAppointments();
      }
    }
  }, [profile, authLoading, navigate]);

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          *,
          profiles!appointments_pet_owner_id_fkey(full_name, phone)
        `)
        .eq("vet_id", profile?.id)
        .order("appointment_date", { ascending: true })
        .order("appointment_time", { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
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

  const updateAppointmentStatus = async (id: string, status: "pending" | "confirmed" | "completed" | "cancelled") => {
    try {
      const { error } = await supabase
        .from("appointments")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Appointment ${status}`,
      });
      
      fetchAppointments();
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

  const todayAppointments = appointments.filter(
    (apt) => apt.appointment_date === format(new Date(), "yyyy-MM-dd")
  );

  return (
    <div className="min-h-screen bg-gradient-hero">
      <header className="bg-card shadow-soft border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Veterinarian Dashboard</h1>
            <p className="text-muted-foreground">Welcome, Dr. {profile?.full_name}</p>
          </div>
          <div className="flex items-center gap-4">
            <Button asChild variant="outline">
              <Link to="/vet/profile">
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
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Button asChild variant="outline" className="h-24 flex-col gap-2">
            <Link to="/vet/profile">
              <UserCircle className="w-6 h-6" />
              <span>My Profile</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-24 flex-col gap-2">
            <Link to="/vet/consultation-videos">
              <Video className="w-6 h-6" />
              <span>Upload Videos</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-24 flex-col gap-2">
            <Link to="/vet/prescriptions">
              <FileText className="w-6 h-6" />
              <span>Prescriptions</span>
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
                <p className="text-sm text-muted-foreground">Today's Appointments</p>
                <p className="text-2xl font-bold text-foreground">{todayAppointments.length}</p>
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
                <Clock className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-foreground">
                  {appointments.filter(a => a.status === "pending").length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-bold text-foreground mb-6">Appointments</h2>
          
          {appointments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No appointments scheduled yet</p>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <Card key={appointment.id} className="p-4 border-2 hover:border-primary transition-colors">
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
                          Owner: {appointment.profiles.full_name}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Phone className="w-4 h-4" />
                          {appointment.profiles.phone}
                        </div>
                      </div>
                      
                      <p className="text-sm text-foreground">
                        <span className="font-medium">Reason:</span> {appointment.reason}
                      </p>
                      
                      <div className="flex items-center gap-2">
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
                    
                    {appointment.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => updateAppointmentStatus(appointment.id, "confirmed")}
                          className="bg-gradient-primary"
                        >
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => updateAppointmentStatus(appointment.id, "cancelled")}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                    
                    {appointment.status === "confirmed" && (
                      <Button
                        size="sm"
                        onClick={() => updateAppointmentStatus(appointment.id, "completed")}
                        className="bg-accent"
                      >
                        Mark Complete
                      </Button>
                    )}
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

export default VetDashboard;
