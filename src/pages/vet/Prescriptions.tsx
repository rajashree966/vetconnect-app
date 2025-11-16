import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Plus, FileText, Download } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import jsPDF from "jspdf";

interface Prescription {
  id: string;
  pet_name: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  diagnosis: string;
  notes: string;
  status: string;
  issued_date: string;
  pet_owner_id: string;
}

export default function Prescriptions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    appointment_id: "",
    pet_owner_id: "",
    pet_name: "",
    medication_name: "",
    dosage: "",
    frequency: "",
    duration: "",
    instructions: "",
    diagnosis: "",
    notes: "",
  });

  useEffect(() => {
    if (user) {
      fetchPrescriptions();
      fetchAppointments();
    }
  }, [user]);

  const fetchPrescriptions = async () => {
    try {
      const { data, error } = await supabase
        .from("prescriptions")
        .select("*")
        .eq("vet_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPrescriptions(data || []);
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

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("vet_id", user?.id)
        .eq("status", "completed");

      if (error) throw error;
      setAppointments(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAppointmentChange = (appointmentId: string) => {
    const appointment = appointments.find(a => a.id === appointmentId);
    if (appointment) {
      setFormData(prev => ({
        ...prev,
        appointment_id: appointmentId,
        pet_owner_id: appointment.pet_owner_id,
        pet_name: appointment.pet_name,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from("prescriptions").insert({
        ...formData,
        vet_id: user?.id,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Prescription created successfully",
      });

      setIsDialogOpen(false);
      setFormData({
        appointment_id: "",
        pet_owner_id: "",
        pet_name: "",
        medication_name: "",
        dosage: "",
        frequency: "",
        duration: "",
        instructions: "",
        diagnosis: "",
        notes: "",
      });
      fetchPrescriptions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const downloadPrescription = (prescription: Prescription) => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text("Prescription", 105, 20, { align: "center" });
    
    doc.setFontSize(12);
    doc.text(`Date: ${new Date(prescription.issued_date).toLocaleDateString()}`, 20, 40);
    doc.text(`Pet Name: ${prescription.pet_name}`, 20, 50);
    doc.text(`Diagnosis: ${prescription.diagnosis}`, 20, 60);
    
    doc.text("Medication Details:", 20, 75);
    doc.text(`Medication: ${prescription.medication_name}`, 30, 85);
    doc.text(`Dosage: ${prescription.dosage}`, 30, 95);
    doc.text(`Frequency: ${prescription.frequency}`, 30, 105);
    doc.text(`Duration: ${prescription.duration}`, 30, 115);
    
    if (prescription.instructions) {
      doc.text(`Instructions: ${prescription.instructions}`, 20, 130);
    }
    
    if (prescription.notes) {
      doc.text(`Notes: ${prescription.notes}`, 20, 145);
    }
    
    doc.save(`prescription-${prescription.pet_name}-${prescription.issued_date}.pdf`);
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Prescriptions</h1>
          <p className="text-muted-foreground">Manage digital prescriptions for your patients</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Prescription
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Prescription</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="appointment">Appointment</Label>
                <Select onValueChange={handleAppointmentChange} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select appointment" />
                  </SelectTrigger>
                  <SelectContent>
                    {appointments.map((apt) => (
                      <SelectItem key={apt.id} value={apt.id}>
                        {apt.pet_name} - {new Date(apt.appointment_date).toLocaleDateString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="diagnosis">Diagnosis</Label>
                <Textarea
                  id="diagnosis"
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="medication_name">Medication Name</Label>
                <Input
                  id="medication_name"
                  value={formData.medication_name}
                  onChange={(e) => setFormData({ ...formData, medication_name: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dosage">Dosage</Label>
                  <Input
                    id="dosage"
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                    placeholder="e.g., 500mg"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="frequency">Frequency</Label>
                  <Input
                    id="frequency"
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                    placeholder="e.g., Twice daily"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="e.g., 7 days"
                  required
                />
              </div>

              <div>
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea
                  id="instructions"
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  placeholder="Special instructions for medication administration"
                />
              </div>

              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any additional notes"
                />
              </div>

              <Button type="submit" className="w-full">Create Prescription</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {prescriptions.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">No prescriptions yet</p>
            </CardContent>
          </Card>
        ) : (
          prescriptions.map((prescription) => (
            <Card key={prescription.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{prescription.pet_name}</CardTitle>
                    <CardDescription>
                      {new Date(prescription.issued_date).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadPrescription(prescription)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><strong>Diagnosis:</strong> {prescription.diagnosis}</p>
                  <p><strong>Medication:</strong> {prescription.medication_name}</p>
                  <p><strong>Dosage:</strong> {prescription.dosage}</p>
                  <p><strong>Frequency:</strong> {prescription.frequency}</p>
                  <p><strong>Duration:</strong> {prescription.duration}</p>
                  {prescription.instructions && (
                    <p><strong>Instructions:</strong> {prescription.instructions}</p>
                  )}
                  {prescription.notes && (
                    <p><strong>Notes:</strong> {prescription.notes}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
