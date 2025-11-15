import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Video } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface ConsultationVideo {
  id: string;
  title: string;
  description?: string;
  video_url: string;
  created_at: string;
}

const ConsultationVideos = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [videos, setVideos] = useState<ConsultationVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchVideos();
    }
  }, [user]);

  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase
        .from("consultation_videos")
        .select("*")
        .eq("pet_owner_id", user?.id)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <p className="text-foreground">Loading videos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero p-6">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/owner/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="flex items-center gap-3 mb-8">
          <Video className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Consultation Videos</h1>
        </div>

        {videos.length === 0 ? (
          <Card className="p-12 text-center">
            <Video className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-xl text-muted-foreground">No consultation videos yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Your veterinarian will upload videos here for you to view
            </p>
          </Card>
        ) : (
          <div className="space-y-6">
            {videos.map((video) => (
              <Card key={video.id} className="p-6">
                <h3 className="text-xl font-bold text-foreground mb-2">
                  {video.title}
                </h3>
                {video.description && (
                  <p className="text-sm text-muted-foreground mb-4">
                    {video.description}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mb-4">
                  Uploaded on {new Date(video.created_at).toLocaleDateString()}
                </p>
                <video
                  src={video.video_url}
                  controls
                  className="w-full rounded-lg"
                />
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsultationVideos;
