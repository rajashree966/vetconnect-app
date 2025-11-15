import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Syringe, Plus, Trash2, Calendar, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { differenceInDays } from "date-fns";

interface Vaccination {
  id: string;
  pet_name: string;
  vaccine_name: string;
  due_date: string;
  status: string;
  notes?: string;
}

const VaccinationSchedule = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [loading, setLoading] = useState(true);
  const [newVaccine, setNewVaccine] = useState({
    pet_name: "",
    vaccine_name: "",
    due_date: "",
    notes: "",
  });

  useEffect(() => {
    if (user) {
      fetchVaccinations();
    }
  }, [user]);

  const fetchVaccinations = async () => {
    try {
      const { data, error } = await supabase
        .from("vaccination_schedule")
        .select("*")
        .eq("pet_owner_id", user?.id)
        .order("due_date", { ascending: true });

      if (error) throw error;

      // Update overdue statuses
      const updatedData = data.map((v: Vaccination) => {
        const daysUntil = differenceInDays(new Date(v.due_date), new Date());
        if (daysUntil < 0 && v.status === "pending") {
          return { ...v, status: "overdue" };
        }
        return v;
      });

      setVaccinations(updatedData);
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

  const handleAddVaccination = async () => {
    if (!newVaccine.pet_name || !newVaccine.vaccine_name || !newVaccine.due_date) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.from("vaccination_schedule").insert([
        {
          pet_owner_id: user?.id,
          ...newVaccine,
        },
      ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Vaccination added to schedule",
      });

      setNewVaccine({ pet_name: "", vaccine_name: "", due_date: "", notes: "" });
      fetchVaccinations();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleMarkCompleted = async (id: string) => {
    try {
      const { error } = await supabase
        .from("vaccination_schedule")
        .update({ status: "completed" })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Vaccination marked as completed",
      });

      fetchVaccinations();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("vaccination_schedule")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Vaccination removed from schedule",
      });

      fetchVaccinations();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string, dueDate: string) => {
    const daysUntil = differenceInDays(new Date(dueDate), new Date());

    if (status === "completed") {
      return <Badge variant="default">Completed</Badge>;
    } else if (status === "overdue" || daysUntil < 0) {
      return <Badge variant="destructive">Overdue</Badge>;
    } else if (daysUntil <= 7) {
      return <Badge className="bg-orange-500">Due Soon</Badge>;
    } else {
      return <Badge variant="secondary">Pending</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <p className="text-foreground">Loading schedule...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero p-6">
      <div className="max-w-6xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/owner/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="flex items-center gap-3 mb-8">
          <Syringe className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Vaccination Schedule</h1>
        </div>

        {/* Upcoming Reminders */}
        {vaccinations.some(
          (v) => v.status !== "completed" && differenceInDays(new Date(v.due_date), new Date()) <= 14
        ) && (
          <Card className="p-6 mb-6 border-orange-500 bg-orange-50 dark:bg-orange-950">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-foreground mb-2">Upcoming Vaccinations</h3>
                <p className="text-sm text-muted-foreground">
                  You have vaccinations due within the next 2 weeks
                </p>
              </div>
            </div>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Add New Vaccination */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Plus className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold text-foreground">Add Vaccination</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pet_name">Pet Name *</Label>
                <Input
                  id="pet_name"
                  value={newVaccine.pet_name}
                  onChange={(e) =>
                    setNewVaccine({ ...newVaccine, pet_name: e.target.value })
                  }
                  placeholder="e.g., Max"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vaccine_name">Vaccine Name *</Label>
                <Input
                  id="vaccine_name"
                  value={newVaccine.vaccine_name}
                  onChange={(e) =>
                    setNewVaccine({ ...newVaccine, vaccine_name: e.target.value })
                  }
                  placeholder="e.g., Rabies, DHPP"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="due_date">Due Date *</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={newVaccine.due_date}
                  onChange={(e) =>
                    setNewVaccine({ ...newVaccine, due_date: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newVaccine.notes}
                  onChange={(e) =>
                    setNewVaccine({ ...newVaccine, notes: e.target.value })
                  }
                  placeholder="Additional information..."
                  rows={3}
                />
              </div>

              <Button onClick={handleAddVaccination} className="w-full">
                Add to Schedule
              </Button>
            </div>
          </Card>

          {/* Vaccination List */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold text-foreground">Schedule</h2>
            </div>

            {vaccinations.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No vaccinations scheduled yet</p>
              </Card>
            ) : (
              vaccinations.map((vaccine) => (
                <Card key={vaccine.id} className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-foreground">
                          {vaccine.vaccine_name}
                        </h3>
                        {getStatusBadge(vaccine.status, vaccine.due_date)}
                      </div>
                      <p className="text-sm text-muted-foreground">Pet: {vaccine.pet_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Due: {new Date(vaccine.due_date).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(vaccine.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>

                  {vaccine.notes && (
                    <p className="text-sm text-muted-foreground mb-3">{vaccine.notes}</p>
                  )}

                  {vaccine.status !== "completed" && (
                    <Button
                      onClick={() => handleMarkCompleted(vaccine.id)}
                      variant="outline"
                      size="sm"
                    >
                      Mark as Completed
                    </Button>
                  )}
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VaccinationSchedule;
