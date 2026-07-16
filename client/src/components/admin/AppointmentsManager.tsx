import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, ChevronLeft, ChevronRight, Clock, Phone, Mail, User, Trash2, Filter, CheckSquare } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { getLocalDateInputValue, isAppointmentWorkingDay } from "@shared/appointmentSchedule";
import type { Appointment } from "@shared/schema";

const weekDaysHe = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];
const weekDaysEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatWhatsAppUrl(phone: string, message?: string) {
  const cleaned = phone.replace(/[^0-9+]/g, '').replace(/^0/, '972')
  const params = message ? `?text=${encodeURIComponent(message)}` : ''
  return `https://wa.me/${cleaned}${params}`
}

const STATUS_CONFIG: Record<string, { he: string; en: string; color: string }> = {
  pending: { he: "ממתינה", en: "Pending", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" },
  confirmed: { he: "מאושרת", en: "Confirmed", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
  cancelled: { he: "בוטלה", en: "Cancelled", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
  completed: { he: "הושלמה", en: "Completed", color: "bg-green-100 text-green-900 dark:bg-green-900/50 dark:text-green-100 font-semibold" },
};

type ManagerFilter = 'all' | 'new'
type AppointmentFilter = 'all' | 'new' | 'pending' | 'confirmed' | 'cancelled' | 'completed'
type CalendarViewMode = 'month' | 'week' | 'day'

const CALENDAR_VIEW_OPTIONS: { value: CalendarViewMode; he: string; en: string }[] = [
  { value: 'month', he: 'חודשי', en: 'Month' },
  { value: 'week', he: 'שבועי', en: 'Week' },
  { value: 'day', he: 'יומי', en: 'Day' },
]

interface AppointmentsManagerProps {
  initialFilter?: 'all' | 'new'
}

const AppointmentsManager = ({ initialFilter = 'all' }: AppointmentsManagerProps) => {
  const { language, isRTL } = useLanguage();
  const isHe = language === "he";
  const { toast } = useToast();
  const [filter, setFilter] = useState<AppointmentFilter>(initialFilter)
  const [calendarView, setCalendarView] = useState<CalendarViewMode>('month')
  const [anchorDate, setAnchorDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  })
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null)

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
    if (filter === 'all') {
      return allAppointments
    }
    return allAppointments.filter(a => a.status === filter)
  }, [allAppointments, filter]);

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await apiRequest("PATCH", `/api/appointments/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      queryClient.invalidateQueries({ queryKey: ["admin-badges"] });
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
      queryClient.invalidateQueries({ queryKey: ["admin-badges"] });
      toast({
        title: isHe ? "הפגישה נמחקה" : "Appointment deleted",
        description: isHe ? "הפגישה נמחקה בהצלחה." : "Appointment has been deleted successfully.",
      });
    },
  });

  const markTestMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("PATCH", `/api/appointments/${id}/mark-test`, { isTest: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      queryClient.invalidateQueries({ queryKey: ["admin-badges"] });
      toast({
        title: isHe ? "סומן כבדיקה" : "Marked as test",
        description: isHe ? "הפריט הוסתר מהרשימה הרגילה." : "The item has been hidden from the normal list.",
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

  const appointmentsByDate = useMemo(() => {
    return allAppointments.reduce<Record<string, Appointment[]>>((groups, appointment) => {
      const key = appointment.date;
      groups[key] = groups[key] || [];
      groups[key].push(appointment);
      return groups;
    }, {});
  }, [allAppointments]);

  const periodLabel = useMemo(() => {
    const locale = isHe ? "he-IL" : "en-US";
    if (calendarView === "month") {
      return anchorDate.toLocaleDateString(locale, { month: "long", year: "numeric" });
    }
    if (calendarView === "week") {
      const start = new Date(anchorDate);
      start.setDate(anchorDate.getDate() - anchorDate.getDay());
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      const startLabel = start.toLocaleDateString(locale, { day: "numeric", month: "short" });
      const endLabel = end.toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });
      return `${startLabel} – ${endLabel}`;
    }
    return anchorDate.toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  }, [anchorDate, calendarView, isHe]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1);
    const start = new Date(firstDay);
    start.setDate(firstDay.getDate() - firstDay.getDay());

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      const value = getLocalDateInputValue(date);
      const outsideMonth = date.getMonth() !== anchorDate.getMonth();
      const closed = !isAppointmentWorkingDay(date);
      const dayAppointments = (appointmentsByDate[value] || [])
        .slice()
        .sort((a, b) => a.time.localeCompare(b.time));

      return { date, value, label: date.getDate(), outsideMonth, closed, appointments: dayAppointments };
    });
  }, [anchorDate, appointmentsByDate]);

  const weekDays = useMemo(() => {
    const start = new Date(anchorDate);
    start.setDate(anchorDate.getDate() - anchorDate.getDay());

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      const value = getLocalDateInputValue(date);
      const closed = !isAppointmentWorkingDay(date);
      const dayAppointments = (appointmentsByDate[value] || [])
        .slice()
        .sort((a, b) => a.time.localeCompare(b.time));

      return { date, value, label: date.getDate(), closed, appointments: dayAppointments };
    });
  }, [anchorDate, appointmentsByDate]);

  const dayViewAppointments = useMemo(() => {
    const value = getLocalDateInputValue(anchorDate);
    return (appointmentsByDate[value] || []).slice().sort((a, b) => a.time.localeCompare(b.time));
  }, [anchorDate, appointmentsByDate]);

  const shiftAnchor = (direction: 1 | -1) => {
    setAnchorDate((current) => {
      const next = new Date(current);
      if (calendarView === "month") next.setMonth(next.getMonth() + direction);
      else if (calendarView === "week") next.setDate(next.getDate() + direction * 7);
      else next.setDate(next.getDate() + direction);
      return next;
    });
  };

  const goToPrevious = () => shiftAnchor(isRTL ? 1 : -1);
  const goToNext = () => shiftAnchor(isRTL ? -1 : 1);

  const selectedAppointment = selectedAppointmentId
    ? allAppointments.find((a) => a.id === selectedAppointmentId) || null
    : null;

  const visibleAppointments = useMemo(() => {
    if (filter === 'new') return appointments.filter(a => a.status === 'pending')
    if (filter === 'all') return appointments
    return appointments.filter(a => a.status === filter)
  }, [appointments, filter])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <CardTitle>{isHe ? "ניהול פגישות" : "Appointment Manager"}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Select value={filter} onValueChange={(value) => setFilter(value as AppointmentFilter)}>
              <SelectTrigger className="w-[150px] h-8 text-xs" data-testid="select-appointment-filter">
                <div className="flex items-center gap-1.5">
                  <Filter className="h-3.5 w-3.5" />
                  <SelectValue placeholder={isHe ? "סינון" : "Filter"} />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isHe ? "הכל" : "All"}</SelectItem>
                <SelectItem value="new">{isHe ? "חדשות בלבד" : "New only"}</SelectItem>
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
          <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-4 lg:items-start">
            <div className="lg:order-2 rounded-lg border bg-muted/20 p-2.5 sm:p-4 space-y-2.5 sm:space-y-3 overflow-hidden" data-testid="appointments-calendar">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Calendar className="h-4 w-4 text-primary shrink-0" />
                  <h3 className="font-semibold text-foreground text-sm sm:text-base">
                    {isHe ? "יומן פגישות" : "Appointments calendar"}
                  </h3>
                </div>
                <div className="inline-flex rounded-md border overflow-hidden shrink-0" role="group" aria-label={isHe ? "תצוגת יומן" : "Calendar view"}>
                  {CALENDAR_VIEW_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setCalendarView(opt.value)}
                      className={cn(
                        "px-2 sm:px-2.5 py-1 text-[11px] sm:text-xs font-medium transition-colors",
                        calendarView === opt.value
                          ? "bg-primary text-primary-foreground"
                          : "bg-background text-muted-foreground hover:bg-muted"
                      )}
                      data-testid={`button-calendar-view-${opt.value}`}
                    >
                      {isHe ? opt.he : opt.en}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  onClick={goToPrevious}
                  data-testid="button-calendar-prev"
                >
                  {isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </Button>
                <div className="flex-1 text-center text-xs sm:text-sm font-medium text-foreground truncate px-1">
                  {periodLabel}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  onClick={goToNext}
                  data-testid="button-calendar-next"
                >
                  {isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
              </div>

              {calendarView === "month" && (
                <>
                  <div className="grid grid-cols-7 gap-0.5 sm:gap-1 text-center text-[10px] sm:text-xs font-medium text-muted-foreground">
                    {(isHe ? weekDaysHe : weekDaysEn).map((day) => (
                      <div key={day} className="py-1 truncate">{day}</div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
                    {calendarDays.map((day) => (
                      <div
                        key={day.value}
                        className={cn(
                          "min-h-[56px] sm:min-h-[74px] md:min-h-[92px] lg:min-h-[46px] rounded-md border p-1 sm:p-1.5 align-top overflow-hidden",
                          day.closed ? "bg-muted/60 border-transparent" : "bg-background",
                          day.outsideMonth && "opacity-40",
                        )}
                        data-testid={`calendar-day-${day.value}`}
                      >
                        <div
                          className={cn(
                            "mb-0.5 sm:mb-1 text-[10px] sm:text-xs font-medium",
                            day.closed
                              ? "text-muted-foreground"
                              : day.appointments.length === 0
                                ? "text-muted-foreground/50"
                                : "text-foreground",
                          )}
                        >
                          {day.label}
                        </div>
                        <div className="space-y-0.5 sm:space-y-1">
                          {day.appointments.slice(0, 3).map((appointment) => {
                            const statusInfo = STATUS_CONFIG[appointment.status] || STATUS_CONFIG.pending;

                            return (
                              <button
                                key={appointment.id}
                                type="button"
                                onClick={() => setSelectedAppointmentId(appointment.id)}
                                className={cn(
                                  "block w-full truncate rounded px-1 py-0.5 text-left text-[9px] sm:text-[10px] font-medium transition-opacity hover:opacity-80",
                                  statusInfo.color,
                                )}
                                data-testid={`calendar-appointment-${appointment.id}`}
                              >
                                <span className="hidden sm:inline">{formatAppointmentTime(appointment.time)} </span>
                                {appointment.clientName}
                              </button>
                            );
                          })}
                          {day.appointments.length > 3 && (
                            <div className="text-[9px] sm:text-[10px] text-muted-foreground">
                              +{day.appointments.length - 3} {isHe ? "נוספות" : "more"}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {calendarView === "week" && (
                <>
                  <div className="grid grid-cols-7 gap-0.5 sm:gap-1 text-center text-[10px] sm:text-xs font-medium text-muted-foreground">
                    {weekDays.map((day) => (
                      <div key={day.value} className="py-1 truncate">
                        {(isHe ? weekDaysHe : weekDaysEn)[day.date.getDay()]}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
                    {weekDays.map((day) => (
                      <div
                        key={day.value}
                        className={cn(
                          "min-h-[110px] sm:min-h-[150px] md:min-h-[190px] rounded-md border p-1 sm:p-1.5 align-top overflow-y-auto",
                          day.closed ? "bg-muted/60 border-transparent" : "bg-background",
                        )}
                        data-testid={`calendar-week-day-${day.value}`}
                      >
                        <div
                          className={cn(
                            "mb-0.5 sm:mb-1 text-[10px] sm:text-xs font-medium",
                            day.closed
                              ? "text-muted-foreground"
                              : day.appointments.length === 0
                                ? "text-muted-foreground/50"
                                : "text-foreground",
                          )}
                        >
                          {day.label}
                        </div>
                        <div className="space-y-0.5 sm:space-y-1">
                          {day.appointments.map((appointment) => {
                            const statusInfo = STATUS_CONFIG[appointment.status] || STATUS_CONFIG.pending;

                            return (
                              <button
                                key={appointment.id}
                                type="button"
                                onClick={() => setSelectedAppointmentId(appointment.id)}
                                className={cn(
                                  "block w-full rounded px-1 py-0.5 text-left leading-tight font-medium transition-opacity hover:opacity-80",
                                  statusInfo.color,
                                )}
                                data-testid={`calendar-appointment-${appointment.id}`}
                              >
                                <span className="block text-[9px] sm:text-[10px]">{formatAppointmentTime(appointment.time)}</span>
                                <span className="block truncate text-[9px] sm:text-[10px]">{appointment.clientName}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {calendarView === "day" && (
                <div className="space-y-1.5 sm:space-y-2">
                  {dayViewAppointments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      {isHe ? "אין פגישות ביום זה" : "No appointments on this day"}
                    </div>
                  ) : (
                    dayViewAppointments.map((appointment) => {
                      const statusInfo = STATUS_CONFIG[appointment.status] || STATUS_CONFIG.pending;

                      return (
                        <button
                          key={appointment.id}
                          type="button"
                          onClick={() => setSelectedAppointmentId(appointment.id)}
                          className="w-full flex items-center justify-between gap-3 rounded-md border bg-background p-2.5 sm:p-3 text-left hover:bg-muted/50 transition-colors"
                          data-testid={`calendar-day-appointment-${appointment.id}`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-semibold text-sm text-foreground shrink-0">
                              {formatAppointmentTime(appointment.time)}
                            </span>
                            <span className="text-sm text-foreground truncate">{appointment.clientName}</span>
                          </div>
                          <Badge
                            variant="secondary"
                            className={`no-default-hover-elevate no-default-active-elevate shrink-0 ${statusInfo.color}`}
                          >
                            {isHe ? statusInfo.he : statusInfo.en}
                          </Badge>
                        </button>
                      );
                    })
                  )}
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                {isHe
                  ? "ימים אפורים מחוץ לשעות הפעילות. לחיצה על פגישה פותחת את פרטיה."
                  : "Greyed-out days are outside working hours. Click an appointment to view or update it."}
              </p>
            </div>

            <div className="lg:order-1">
            {visibleAppointments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground" data-testid="empty-appointments">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>{isHe ? "אין פגישות להצגה" : "No appointments to display"}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {visibleAppointments.map((appointment) => {
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
                        onClick={() => markTestMutation.mutate(appointment.id)}
                        disabled={markTestMutation.isPending}
                        data-testid={`button-mark-test-appt-${appointment.id}`}
                      >
                        {isHe ? "סמן כבדיקה" : "Mark as test"}
                      </Button>
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
          </div>
        )}
      </CardContent>

      <Dialog open={!!selectedAppointment} onOpenChange={(open) => !open && setSelectedAppointmentId(null)}>
        <DialogContent className="max-w-sm">
          {selectedAppointment && (() => {
            const statusInfo = STATUS_CONFIG[selectedAppointment.status] || STATUS_CONFIG.pending;

            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    {selectedAppointment.clientName}
                  </DialogTitle>
                  <DialogDescription className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatAppointmentDate(selectedAppointment.date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {formatAppointmentTime(selectedAppointment.time)}
                    </span>
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Select
                      value={selectedAppointment.status}
                      onValueChange={(status) => updateStatus.mutate({ id: selectedAppointment.id, status })}
                    >
                      <SelectTrigger className="h-8 text-xs w-[130px]" data-testid="select-appointment-status-dialog">
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
                    <Badge
                      variant="secondary"
                      className={`no-default-hover-elevate no-default-active-elevate ${statusInfo.color}`}
                    >
                      {isHe ? statusInfo.he : statusInfo.en}
                    </Badge>
                  </div>

                  <div className="space-y-1.5 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" />
                      {selectedAppointment.clientEmail}
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" />
                      {selectedAppointment.clientPhone}
                    </div>
                    {selectedAppointment.clientPhone && (
                      <a
                        href={formatWhatsAppUrl(selectedAppointment.clientPhone, isHe ? `שלום ${selectedAppointment.clientName}, פונה אליך מקשב פלוס בנוגע לפגישה שלך` : `Hi ${selectedAppointment.clientName}, reaching out from KeshevPlus regarding your appointment`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[#25D366] hover:underline"
                        data-testid="link-whatsapp-appointment-dialog"
                      >
                        <SiWhatsapp className="w-3.5 h-3.5" />
                        <span className="text-xs">WhatsApp</span>
                      </a>
                    )}
                  </div>

                  <Badge variant="outline" className="no-default-hover-elevate no-default-active-elevate">
                    {selectedAppointment.type}
                  </Badge>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default AppointmentsManager;
