import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, FileText, Plus, Trash2, Calendar as CalendarIcon, Download, Upload, X } from "lucide-react";
import MedicalTimeline from "@/components/MedicalTimeline";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface HealthRecord {
  id: string;
  pet_name: string;
  date: string;
  type: "vaccination" | "checkup" | "treatment" | "surgery";
  title: string;
  description: string;
  veterinarian: string;
  file_urls?: string[];
}

const HealthRecords = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [newRecord, setNewRecord] = useState<{
    pet_name: string;
    date: string;
    type: "vaccination" | "checkup" | "treatment" | "surgery" | "";
    title: string;
    description: string;
    veterinarian: string;
  }>({
    pet_name: "",
    date: "",
    type: "",
    title: "",
    description: "",
    veterinarian: "",
  });

  useEffect(() => {
    if (user) {
      fetchRecords();
    }
  }, [user]);

  const fetchRecords = async () => {
    try {
      const { data, error } = await supabase
        .from("medical_records")
        .select("*")
        .eq("pet_owner_id", user?.id)
        .order("date", { ascending: false });

      if (error) throw error;
      setRecords(data?.map(record => ({
        id: record.id,
        pet_name: record.pet_name,
        date: record.date,
        type: record.type as "vaccination" | "checkup" | "treatment" | "surgery",
        title: record.title,
        description: record.description,
        veterinarian: record.veterinarian,
        file_urls: record.file_urls
      })) || []);
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const handleAddRecord = async () => {
    if (!newRecord.pet_name || !newRecord.date || !newRecord.type || !newRecord.title || !newRecord.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setUploadingFiles(true);

    try {
      let fileUrls: string[] = [];

      // Upload files if any
      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          const fileExt = file.name.split(".").pop();
          const fileName = `${user?.id}/${Date.now()}-${Math.random()}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from("medical-documents")
            .upload(fileName, file);

          if (uploadError) throw uploadError;

          const { data: urlData } = supabase.storage
            .from("medical-documents")
            .getPublicUrl(fileName);

          fileUrls.push(urlData.publicUrl);
        }
      }

      // Save record to database
      const { error } = await supabase.from("medical_records").insert([
        {
          pet_owner_id: user?.id,
          pet_name: newRecord.pet_name,
          date: newRecord.date,
          type: newRecord.type,
          title: newRecord.title,
          description: newRecord.description,
          veterinarian: newRecord.veterinarian,
          file_urls: fileUrls,
        },
      ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Health record added successfully",
      });

      setNewRecord({ pet_name: "", date: "", type: "", title: "", description: "", veterinarian: "" });
      setSelectedFiles([]);
      fetchRecords();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploadingFiles(false);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    try {
      const { error } = await supabase
        .from("medical_records")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Deleted",
        description: "Health record removed",
      });

      fetchRecords();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text("Pet Medical History", 14, 22);
    
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}`, 14, 30);
    
    const tableData = records
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .map(record => [
        record.pet_name,
        new Date(record.date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
        record.type.charAt(0).toUpperCase() + record.type.slice(1),
        record.veterinarian || 'N/A',
        record.description
      ]);
    
    autoTable(doc, {
      startY: 35,
      head: [['Pet', 'Date', 'Type', 'Vet', 'Description']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 28 },
        2: { cellWidth: 22 },
        3: { cellWidth: 30 },
        4: { cellWidth: 'auto' }
      }
    });
    
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
                    <Label htmlFor="pet_name">Pet Name *</Label>
                    <Input
                      id="pet_name"
                      value={newRecord.pet_name}
                      onChange={(e) => setNewRecord({ ...newRecord, pet_name: e.target.value })}
                      placeholder="e.g., Max"
                    />
                  </div>

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
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={newRecord.title}
                      onChange={(e) => setNewRecord({ ...newRecord, title: e.target.value })}
                      placeholder="e.g., Annual Checkup"
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

                  <div className="space-y-2">
                    <Label htmlFor="files">Attach Documents/Images</Label>
                    <Input
                      id="files"
                      type="file"
                      multiple
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={handleFileSelect}
                    />
                    {selectedFiles.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between text-sm bg-muted p-2 rounded">
                            <span>{file.name}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveFile(index)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button onClick={handleAddRecord} disabled={uploadingFiles} className="w-full">
                    {uploadingFiles ? "Uploading..." : "Add Record"}
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
