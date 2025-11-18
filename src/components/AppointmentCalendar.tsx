import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, MapPin } from "lucide-react";
import { format } from "date-fns";

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  pet_name: string;
  pet_type: string;
  reason: string;
  status: string;
  consultation_type?: string;
  vet_name?: string;
  owner_name?: string;
}

interface AppointmentCalendarProps {
  appointments: Appointment[];
  userRole: "vet" | "pet_owner";
}

export default function AppointmentCalendar({ appointments, userRole }: AppointmentCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedDayAppointments, setSelectedDayAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    if (selectedDate) {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const dayAppointments = appointments.filter(
        (apt) => apt.appointment_date === dateStr
      );
      setSelectedDayAppointments(dayAppointments);
    }
  }, [selectedDate, appointments]);

  const appointmentDates = appointments.map((apt) => new Date(apt.appointment_date));

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-primary text-primary-foreground";
      case "pending":
        return "bg-secondary text-secondary-foreground";
      case "completed":
        return "bg-accent text-accent-foreground";
      case "cancelled":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted";
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Calendar</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
            modifiers={{
              booked: appointmentDates,
            }}
            modifiersStyles={{
              booked: {
                fontWeight: "bold",
                backgroundColor: "hsl(var(--primary) / 0.2)",
              },
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Select a date"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[350px] pr-4">
            {selectedDayAppointments.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No appointments scheduled for this day
              </p>
            ) : (
              <div className="space-y-4">
                {selectedDayAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{apt.pet_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {apt.pet_type}
                        </p>
                      </div>
                      <Badge className={getStatusColor(apt.status)}>
                        {apt.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Clock className="h-4 w-4" />
                      {apt.appointment_time}
                    </div>
                    
                    {apt.consultation_type && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <MapPin className="h-4 w-4" />
                        {apt.consultation_type}
                      </div>
                    )}
                    
                    <p className="text-sm mt-2">
                      <span className="font-medium">Reason:</span> {apt.reason}
                    </p>
                    
                    {userRole === "vet" && apt.owner_name && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Owner: {apt.owner_name}
                      </p>
                    )}
                    
                    {userRole === "pet_owner" && apt.vet_name && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Vet: {apt.vet_name}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
