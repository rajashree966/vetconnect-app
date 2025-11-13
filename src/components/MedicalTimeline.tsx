import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Syringe, Stethoscope, Pill, Activity } from "lucide-react";

interface TimelineEvent {
  id: string;
  date: string;
  type: "vaccination" | "checkup" | "treatment" | "surgery";
  title: string;
  description: string;
  veterinarian?: string;
}

interface MedicalTimelineProps {
  events: TimelineEvent[];
}

const MedicalTimeline = ({ events }: MedicalTimelineProps) => {
  const getEventIcon = (type: TimelineEvent["type"]) => {
    switch (type) {
      case "vaccination":
        return <Syringe className="w-5 h-5" />;
      case "checkup":
        return <Stethoscope className="w-5 h-5" />;
      case "treatment":
        return <Pill className="w-5 h-5" />;
      case "surgery":
        return <Activity className="w-5 h-5" />;
      default:
        return <Stethoscope className="w-5 h-5" />;
    }
  };

  const getEventColor = (type: TimelineEvent["type"]) => {
    switch (type) {
      case "vaccination":
        return "bg-accent";
      case "checkup":
        return "bg-primary";
      case "treatment":
        return "bg-secondary";
      case "surgery":
        return "bg-destructive";
      default:
        return "bg-muted";
    }
  };

  const getEventBadgeVariant = (type: TimelineEvent["type"]): "default" | "secondary" | "destructive" | "outline" => {
    switch (type) {
      case "vaccination":
        return "default";
      case "checkup":
        return "secondary";
      case "treatment":
        return "outline";
      case "surgery":
        return "destructive";
      default:
        return "outline";
    }
  };

  const sortedEvents = [...events].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (events.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No medical history recorded yet</p>
      </Card>
    );
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border" />

      {/* Timeline events */}
      <div className="space-y-8">
        {sortedEvents.map((event, index) => (
          <div key={event.id} className="relative flex gap-6">
            {/* Timeline dot */}
            <div className="relative z-10 flex-shrink-0">
              <div className={`w-16 h-16 rounded-full ${getEventColor(event.type)} flex items-center justify-center text-primary-foreground shadow-soft`}>
                {getEventIcon(event.type)}
              </div>
            </div>

            {/* Event card */}
            <Card className="flex-1 p-6 hover:shadow-medium transition-all">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-foreground">{event.title}</h3>
                    <Badge variant={getEventBadgeVariant(event.type)}>
                      {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(event.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              <p className="text-muted-foreground mb-3">{event.description}</p>

              {event.veterinarian && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Stethoscope className="w-4 h-4" />
                  <span>by {event.veterinarian}</span>
                </div>
              )}

              {/* Connecting line to next event */}
              {index < sortedEvents.length - 1 && (
                <div className="absolute -bottom-4 left-8 w-0.5 h-4 bg-border" />
              )}
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MedicalTimeline;
