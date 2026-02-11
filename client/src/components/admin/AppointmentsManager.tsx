import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Phone, Mail, User, Trash2, Filter } from "lucide-react";
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

const AppointmentsManager = () => {
  const { language } = useLanguage();
  const isHe = language === "he";
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const queryUrl = statusFilter === "all" ? "/api/appointments" : `/api/appointments?status=${statusFilter}`;
  const { data: appointments = [], isLoading } = useQuery<Appointment[]>({
    queryKey: [queryUrl],
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await apiRequest("PATCH", `/api/appointments/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ predicate: (query) => {
        const key = query.queryKey[0];
        return typeof key === "string" && key.startsWith("/api/appointments");
      }});
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
      queryClient.invalidateQueries({ queryKey: [queryUrl] });
      toast({
        title: isHe ? "הפגישה נמחקה" : "Appointment deleted",
        description: isHe ? "הפגישה נמחקה בהצלחה." : "Appointment has been deleted successfully.",
      });
    },
  });

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleString(isHe ? "he-IL" : "en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <CardTitle>{isHe ? "ניהול פגישות" : "Appointment Manager"}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
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
        ) : appointments.length === 0 ? (
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
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(appointment.date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {appointment.time}
                    </span>
                    <Badge variant="outline" className="no-default-hover-elevate no-default-active-elevate" data-testid={`badge-type-${appointment.id}`}>
                      {appointment.type}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AppointmentsManager;
