import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, FileText, Plus, Trash2 } from "lucide-react";

interface HealthRecord {
  id: string;
  date: string;
  type: string;
  description: string;
  veterinarian: string;
}

const HealthRecords = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [newRecord, setNewRecord] = useState({
    date: "",
    type: "",
    description: "",
    veterinarian: "",
  });

  const handleAddRecord = () => {
    if (!newRecord.date || !newRecord.type || !newRecord.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const record: HealthRecord = {
      id: Date.now().toString(),
      ...newRecord,
    };

    setRecords([record, ...records]);
    setNewRecord({ date: "", type: "", description: "", veterinarian: "" });
    
    toast({
      title: "Success",
      description: "Health record added successfully",
    });
  };

  const handleDeleteRecord = (id: string) => {
    setRecords(records.filter(record => record.id !== id));
    toast({
      title: "Deleted",
      description: "Health record removed",
    });
  };

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

        <div className="grid md:grid-cols-2 gap-6">
          {/* Add New Record */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Plus className="w-8 h-8 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Add Health Record</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={newRecord.date}
                  onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type of Visit *</Label>
                <Input
                  id="type"
                  value={newRecord.type}
                  onChange={(e) => setNewRecord({ ...newRecord, type: e.target.value })}
                  placeholder="e.g., Vaccination, Checkup, Surgery"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="veterinarian">Veterinarian</Label>
                <Input
                  id="veterinarian"
                  value={newRecord.veterinarian}
                  onChange={(e) => setNewRecord({ ...newRecord, veterinarian: e.target.value })}
                  placeholder="Dr. Name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={newRecord.description}
                  onChange={(e) => setNewRecord({ ...newRecord, description: e.target.value })}
                  placeholder="Details about the visit, treatments, medications, etc."
                  rows={4}
                />
              </div>

              <Button onClick={handleAddRecord} className="w-full">
                Add Record
              </Button>
            </div>
          </Card>

          {/* Records List */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Health History</h2>
            </div>
            
            {records.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No health records added yet</p>
              </Card>
            ) : (
              records.map((record) => (
                <Card key={record.id} className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-foreground">{record.type}</h3>
                      <p className="text-sm text-muted-foreground">{record.date}</p>
                      {record.veterinarian && (
                        <p className="text-sm text-muted-foreground">by {record.veterinarian}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteRecord(record.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                  <p className="text-muted-foreground">{record.description}</p>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthRecords;
