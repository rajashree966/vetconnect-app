import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Video, Upload, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface ConsultationVideo {
  id: string;
  title: string;
  description?: string;
  video_url: string;
  created_at: string;
  pet_owner_id: string;
}

const ConsultationVideos = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [videos, setVideos] = useState<ConsultationVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [newVideo, setNewVideo] = useState({
    title: "",
    description: "",
    pet_owner_id: "",
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [owners, setOwners] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchVideos();
      fetchPetOwners();
    }
  }, [user]);

  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase
        .from("consultation_videos")
        .select("*")
        .eq("vet_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setVideos(data || []);
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

  const fetchPetOwners = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .eq("role", "pet_owner");

      if (error) throw error;
      setOwners(data || []);
    } catch (error: any) {
      console.error("Error fetching owners:", error);
    }
  };

  const handleUpload = async () => {
    if (!newVideo.title || !newVideo.pet_owner_id || !videoFile) {
      toast({
        title: "Error",
        description: "Please fill in all required fields and select a video",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Upload video to storage
      const fileExt = videoFile.name.split(".").pop();
      const fileName = `${user?.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("consultation-videos")
        .upload(fileName, videoFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("consultation-videos")
        .getPublicUrl(fileName);

      // Save video record
      const { error: dbError } = await supabase.from("consultation_videos").insert([
        {
          vet_id: user?.id,
          pet_owner_id: newVideo.pet_owner_id,
          title: newVideo.title,
          description: newVideo.description,
          video_url: urlData.publicUrl,
        },
      ]);

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Consultation video uploaded successfully",
      });

      setNewVideo({ title: "", description: "", pet_owner_id: "" });
      setVideoFile(null);
      fetchVideos();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, videoUrl: string) => {
    try {
      // Extract filename from URL
      const fileName = videoUrl.split("/").slice(-2).join("/");

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("consultation-videos")
        .remove([fileName]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from("consultation_videos")
        .delete()
        .eq("id", id);

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Video deleted successfully",
      });

      fetchVideos();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <p className="text-foreground">Loading videos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero p-6">
      <div className="max-w-6xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/vet/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="flex items-center gap-3 mb-8">
          <Video className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Consultation Videos</h1>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Upload Form */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Upload className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold text-foreground">Upload Video</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={newVideo.title}
                  onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                  placeholder="e.g., Post-Surgery Care Instructions"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pet_owner">Pet Owner *</Label>
                <select
                  id="pet_owner"
                  value={newVideo.pet_owner_id}
                  onChange={(e) =>
                    setNewVideo({ ...newVideo, pet_owner_id: e.target.value })
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select pet owner...</option>
                  {owners.map((owner) => (
                    <option key={owner.id} value={owner.id}>
                      {owner.full_name} ({owner.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newVideo.description}
                  onChange={(e) =>
                    setNewVideo({ ...newVideo, description: e.target.value })
                  }
                  placeholder="Additional information about the consultation..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="video">Video File *</Label>
                <Input
                  id="video"
                  type="file"
                  accept="video/*"
                  onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                />
              </div>

              <Button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full"
              >
                {uploading ? "Uploading..." : "Upload Video"}
              </Button>
            </div>
          </Card>

          {/* Videos List */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">Uploaded Videos</h2>

            {videos.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No videos uploaded yet</p>
              </Card>
            ) : (
              videos.map((video) => (
                <Card key={video.id} className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-foreground mb-2">
                        {video.title}
                      </h3>
                      {video.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {video.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(video.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(video.id, video.video_url)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>

                  <video
                    src={video.video_url}
                    controls
                    className="w-full rounded-lg"
                  />
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultationVideos;
