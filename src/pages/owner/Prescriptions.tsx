import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Download, FileText } from "lucide-react";
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
}

export default function Prescriptions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPrescriptions();
    }
  }, [user]);

  const fetchPrescriptions = async () => {
    try {
      const { data, error } = await supabase
        .from("prescriptions")
        .select("*")
        .eq("pet_owner_id", user?.id)
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
      <div>
        <h1 className="text-3xl font-bold">My Prescriptions</h1>
        <p className="text-muted-foreground">View and download your pet's prescriptions</p>
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
                  <div className={`inline-block px-3 py-1 rounded-full text-sm ${
                    prescription.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {prescription.status}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
