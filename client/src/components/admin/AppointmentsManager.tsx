import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Phone, Mail, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Appointment } from "@shared/schema";

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

  const { data: appointments = [], isLoading } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments", statusFilter],
    queryFn: async () => {
      const url = statusFilter === "all" ? "/api/appointments" : `/api/appointments?status=${statusFilter}`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

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

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString(isHe ? "he-IL" : "en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
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
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]" data-testid="select-appointment-filter">
              <SelectValue placeholder={isHe ? "סינון לפי סטטוס" : "Filter by status"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" data-testid="filter-all">{isHe ? "הכל" : "All"}</SelectItem>
              <SelectItem value="pending" data-testid="filter-pending">{isHe ? "ממתינות" : "Pending"}</SelectItem>
              <SelectItem value="confirmed" data-testid="filter-confirmed">{isHe ? "מאושרות" : "Confirmed"}</SelectItem>
              <SelectItem value="cancelled" data-testid="filter-cancelled">{isHe ? "בוטלו" : "Cancelled"}</SelectItem>
              <SelectItem value="completed" data-testid="filter-completed">{isHe ? "הושלמו" : "Completed"}</SelectItem>
            </SelectContent>
          </Select>
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
                      {appointment.status !== "confirmed" && appointment.status !== "completed" && appointment.status !== "cancelled" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatus.mutate({ id: appointment.id, status: "confirmed" })}
                          disabled={updateStatus.isPending}
                          data-testid={`button-confirm-${appointment.id}`}
                        >
                          {isHe ? "אישור" : "Confirm"}
                        </Button>
                      )}
                      {appointment.status !== "completed" && appointment.status !== "cancelled" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatus.mutate({ id: appointment.id, status: "completed" })}
                          disabled={updateStatus.isPending}
                          data-testid={`button-complete-${appointment.id}`}
                        >
                          {isHe ? "השלמה" : "Complete"}
                        </Button>
                      )}
                      {appointment.status !== "cancelled" && appointment.status !== "completed" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatus.mutate({ id: appointment.id, status: "cancelled" })}
                          disabled={updateStatus.isPending}
                          data-testid={`button-cancel-${appointment.id}`}
                        >
                          {isHe ? "ביטול" : "Cancel"}
                        </Button>
                      )}
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
