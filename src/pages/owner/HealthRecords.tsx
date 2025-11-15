import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, FileText, Plus, Trash2, Calendar as CalendarIcon, Download } from "lucide-react";
import MedicalTimeline from "@/components/MedicalTimeline";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface HealthRecord {
  id: string;
  date: string;
  type: "vaccination" | "checkup" | "treatment" | "surgery";
  description: string;
  veterinarian: string;
}

const HealthRecords = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [newRecord, setNewRecord] = useState<{
    date: string;
    type: "vaccination" | "checkup" | "treatment" | "surgery" | "";
    description: string;
    veterinarian: string;
  }>({
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

    if (!newRecord.type) {
      toast({
        title: "Error",
        description: "Please select a type of visit",
        variant: "destructive",
      });
      return;
    }

    const record: HealthRecord = {
      id: Date.now().toString(),
      date: newRecord.date,
      type: newRecord.type as "vaccination" | "checkup" | "treatment" | "surgery",
      description: newRecord.description,
      veterinarian: newRecord.veterinarian,
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

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text("Pet Medical History", 14, 22);
    
    // Add generation date
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}`, 14, 30);
    
    // Prepare table data
    const tableData = records
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .map(record => [
        new Date(record.date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
        record.type.charAt(0).toUpperCase() + record.type.slice(1),
        record.veterinarian || 'N/A',
        record.description
      ]);
    
    // Add table
    autoTable(doc, {
      startY: 35,
      head: [['Date', 'Type', 'Veterinarian', 'Description']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 25 },
        2: { cellWidth: 35 },
        3: { cellWidth: 'auto' }
      }
    });
    
    // Save the PDF
    doc.save(`pet-medical-history-${new Date().toISOString().split('T')[0]}.pdf`);
    
    toast({
      title: "Success",
      description: "Medical history exported to PDF",
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

        <Tabs defaultValue="timeline" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="timeline">
              <CalendarIcon className="w-4 h-4 mr-2" />
              Timeline View
            </TabsTrigger>
            <TabsTrigger value="manage">
              <Plus className="w-4 h-4 mr-2" />
              Manage Records
            </TabsTrigger>
          </TabsList>

          {/* Timeline View */}
          <TabsContent value="timeline">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-primary" />
                  <h2 className="text-2xl font-bold text-foreground">Medical History Timeline</h2>
                </div>
                {records.length > 0 && (
                  <Button onClick={handleExportPDF} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export PDF
                  </Button>
                )}
              </div>
              
              <MedicalTimeline 
                events={records.map(record => ({
                  id: record.id,
                  date: record.date,
                  type: record.type,
                  title: record.type.charAt(0).toUpperCase() + record.type.slice(1),
                  description: record.description,
                  veterinarian: record.veterinarian
                }))}
              />
            </div>
          </TabsContent>

          {/* Manage Records View */}
          <TabsContent value="manage">
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
                    <Select
                      value={newRecord.type}
                      onValueChange={(value: "vaccination" | "checkup" | "treatment" | "surgery") => 
                        setNewRecord({ ...newRecord, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vaccination">Vaccination</SelectItem>
                        <SelectItem value="checkup">Checkup</SelectItem>
                        <SelectItem value="treatment">Treatment</SelectItem>
                        <SelectItem value="surgery">Surgery</SelectItem>
                      </SelectContent>
                    </Select>
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
                  <h2 className="text-2xl font-bold text-foreground">All Records</h2>
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
                          <h3 className="text-xl font-bold text-foreground capitalize">{record.type}</h3>
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default HealthRecords;
