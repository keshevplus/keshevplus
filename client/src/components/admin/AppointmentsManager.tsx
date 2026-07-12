import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Phone, Mail, User, Trash2, Filter, CheckSquare } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Appointment } from "@shared/schema";

function formatWhatsAppUrl(phone: string, message?: string) {
  const cleaned = phone.replace(/[^0-9+]/g, '').replace(/^0/, '972')
  const params = message ? `?text=${encodeURIComponent(message)}` : ''
  return `https://wa.me/${cleaned}${params}`
}

const STATUS_CONFIG: Record<string, { he: string; en: string; color: string }> = {
  pending: { he: "ממתינה", en: "Pending", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" },
  confirmed: { he: "מאושרת", en: "Confirmed", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
  cancelled: { he: "בוטלה", en: "Cancelled", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
  completed: { he: "הושלמה", en: "Completed", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
};

type ManagerFilter = 'all' | 'new'

interface AppointmentsManagerProps {
  initialFilter?: ManagerFilter
}

const AppointmentsManager = ({ initialFilter = 'all' }: AppointmentsManagerProps) => {
  const { language } = useLanguage();
  const isHe = language === "he";
  const { toast } = useToast();
  const [filter, setFilter] = useState<ManagerFilter>(initialFilter)

  useEffect(() => {
    setFilter(initialFilter)
  }, [initialFilter])

  const { data: allAppointments = [], isLoading } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments"],
  });

  const appointments = useMemo(() => {
    if (filter === 'new') {
      return allAppointments.filter(a => a.status === 'pending') // pending/new bookings
    }
    return allAppointments
  }, [appointments, filter]);

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await apiRequest("PATCH", `/api/appointments/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({
        title: isHe ? "הסטטוס עודכן" : "Status updated",
        description: isHe ? "סטטוס הפגישה עודכן בהצלחה." : "Appointment status has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: isHe ? "שגיאה" : "Error",
        description: isHe ? "עדכון הסטטוס נכשל." : "Failed to update status.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/appointments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({
        title: isHe ? "הפגישה נמחקה" : "Appointment deleted",
        description: isHe ? "הפגישה נמחקה בהצלחה." : "Appointment has been deleted successfully.",
      });
    },
  });

  const parseDateOnly = (date: string) => {
    const [year, month, day] = date.split("-").map(Number);
    if (year && month && day) {
      return new Date(year, month - 1, day);
    }
    return new Date(date);
  };

  const formatAppointmentDate = (date: string) => {
    const d = parseDateOnly(date);
    return d.toLocaleDateString(isHe ? "he-IL" : "en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatAppointmentTime = (time: string) => {
    return time ? time.slice(0, 5) : "";
  };

  const getAppointmentStart = (appointment: Appointment) => {
    const [year, month, day] = appointment.date.split("-").map(Number);
    const [hour = 0, minute = 0] = appointment.time.split(":").map(Number);

    if (year && month && day) {
      return new Date(year, month - 1, day, hour, minute);
    }

    return new Date(appointment.date);
  };

  const formatTimestamp = (date?: string | Date | null) => {
    if (!date) return isHe ? "לא תועד" : "Not recorded";
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return isHe ? "לא תועד" : "Not recorded";

    return d.toLocaleString(isHe ? "he-IL" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const upcomingAppointments = useMemo(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    return allAppointments
      .filter((appointment) => {
        if (!["pending", "confirmed"].includes(appointment.status)) return false;
        return getAppointmentStart(appointment) >= startOfToday;
      })
      .sort((a, b) => getAppointmentStart(a).getTime() - getAppointmentStart(b).getTime());
  }, [allAppointments]);

  const groupedUpcomingAppointments = useMemo(() => {
    return upcomingAppointments.reduce<Record<string, Appointment[]>>((groups, appointment) => {
      const key = appointment.date;
      groups[key] = groups[key] || [];
      groups[key].push(appointment);
      return groups;
    }, {});
  }, [upcomingAppointments]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <CardTitle>{isHe ? "ניהול פגישות" : "Appointment Manager"}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[150px] h-8 text-xs" data-testid="select-appointment-filter">
                <div className="flex items-center gap-1.5">
                  <Filter className="h-3.5 w-3.5" />
                  <SelectValue placeholder={isHe ? "סינון" : "Filter"} />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isHe ? "הכל" : "All"}</SelectItem>
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{isHe ? config.he : config.en}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <CardDescription>{isHe ? "צפייה וניהול פגישות עם לקוחות" : "View and manage client appointments"}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/20 p-4 space-y-3" data-testid="appointments-calendar">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-foreground">
                    {isHe ? "יומן פגישות קרובות" : "Upcoming appointments calendar"}
                  </h3>
                </div>
                <Badge variant="outline" className="no-default-hover-elevate no-default-active-elevate">
                  {upcomingAppointments.length} {isHe ? "קרובות" : "upcoming"}
                </Badge>
              </div>
              {upcomingAppointments.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {isHe ? "אין פגישות קרובות להצגה." : "No upcoming appointments to display."}
                </p>
              ) : (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {Object.entries(groupedUpcomingAppointments).map(([date, items]) => (
                    <div key={date} className="rounded-md border bg-background p-3">
                      <div className="font-medium text-sm text-foreground">
                        {formatAppointmentDate(date)}
                      </div>
                      <div className="mt-3 space-y-2">
                        {items.map((appointment) => {
                          const statusInfo = STATUS_CONFIG[appointment.status] || STATUS_CONFIG.pending;

                          return (
                            <div key={appointment.id} className="rounded-md bg-muted/50 p-2 text-sm">
                              <div className="flex items-center justify-between gap-2">
                                <span className="flex items-center gap-1 font-semibold text-foreground">
                                  <Clock className="h-3.5 w-3.5 text-primary" />
                                  {formatAppointmentTime(appointment.time)}
                                </span>
                                <Badge
                                  variant="secondary"
                                  className={`no-default-hover-elevate no-default-active-elevate ${statusInfo.color}`}
                                >
                                  {isHe ? statusInfo.he : statusInfo.en}
                                </Badge>
                              </div>
                              <div className="mt-1 font-medium text-foreground">{appointment.clientName}</div>
                              <div className="text-xs text-muted-foreground">{appointment.type}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {appointments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground" data-testid="empty-appointments">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>{isHe ? "אין פגישות להצגה" : "No appointments to display"}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {appointments.map((appointment) => {
                  const statusInfo = STATUS_CONFIG[appointment.status] || STATUS_CONFIG.pending;

              return (
                <div
                  key={appointment.id}
                  className="border rounded-lg p-4 space-y-3"
                  data-testid={`appointment-${appointment.id}`}
                >
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-muted-foreground" />
                        {appointment.clientName}
                      </span>
                      <Badge
                        variant="secondary"
                        className={`no-default-hover-elevate no-default-active-elevate ${statusInfo.color}`}
                        data-testid={`badge-status-${appointment.id}`}
                      >
                        {isHe ? statusInfo.he : statusInfo.en}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 flex-wrap">
                      <Select 
                        value={appointment.status} 
                        onValueChange={(status) => updateStatus.mutate({ id: appointment.id, status })}
                      >
                        <SelectTrigger className="h-8 text-xs w-[110px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                            <SelectItem key={key} value={key} className="text-xs">
                              {isHe ? config.he : config.en}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive border-destructive/30"
                        onClick={() => {
                          if (window.confirm(isHe ? `למחוק את הפגישה עם ${appointment.clientName}?` : `Delete appointment with ${appointment.clientName}?`)) {
                            deleteMutation.mutate(appointment.id)
                          }
                        }}
                        disabled={deleteMutation.isPending}
                        data-testid={`button-delete-appt-${appointment.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-wrap text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" />
                      {appointment.clientEmail}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" />
                      {appointment.clientPhone}
                    </span>
                    {appointment.clientPhone && (
                      <a
                        href={formatWhatsAppUrl(appointment.clientPhone, isHe ? `שלום ${appointment.clientName}, פונה אליך מקשב פלוס בנוגע לפגישה שלך` : `Hi ${appointment.clientName}, reaching out from KeshevPlus regarding your appointment`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[#25D366] hover:underline"
                        data-testid={`link-whatsapp-appointment-${appointment.id}`}
                      >
                        <SiWhatsapp className="w-3.5 h-3.5" />
                        <span className="text-xs">WhatsApp</span>
                      </a>
                    )}
                    <Badge variant="outline" className="no-default-hover-elevate no-default-active-elevate" data-testid={`badge-type-${appointment.id}`}>
                      {appointment.type}
                    </Badge>
                    <Badge variant="outline" className="no-default-hover-elevate no-default-active-elevate">
                      {(appointment as any).appointmentFor === "child"
                        ? (isHe ? "עבור הילד/ה" : "For the child")
                        : (isHe ? "עבורי" : "For me")}
                    </Badge>
                    {(appointment as any).appointmentFor === "child" && appointment.childName && (
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        {appointment.childName}
                        {(appointment as any).childAge ? `, ${isHe ? "גיל" : "age"} ${(appointment as any).childAge}` : ""}
                      </span>
                    )}
                  </div>
                  <div className="border-t pt-3 mt-2 space-y-2">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <span className="flex items-center gap-2 font-medium text-foreground">
                        <CheckSquare className="w-4 h-4 text-green-600 dark:text-green-400" />
                        {isHe ? "הפגישה נקבעה ל:" : "Appointment scheduled for:"}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 font-semibold text-foreground">
                          <Calendar className="w-4 h-4 text-primary" />
                          {formatAppointmentDate(appointment.date)}
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-foreground">
                          <Clock className="w-4 h-4 text-primary" />
                          {formatAppointmentTime(appointment.time)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-4 flex-wrap text-xs">
                      <span className="text-muted-foreground">
                        {isHe ? "הטופס נשלח ב:" : "Form submitted:"}
                      </span>
                      <span className="text-muted-foreground">
                        {formatTimestamp(appointment.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4 flex-wrap text-xs">
                      <span className="text-muted-foreground">
                        {isHe ? "אושר ב:" : "Approved on:"}
                      </span>
                      <span className="text-muted-foreground">
                        {formatTimestamp(appointment.approvedAt)}
                      </span>
                    </div>
                  </div>
                </div>
              );
                })}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AppointmentsManager;
