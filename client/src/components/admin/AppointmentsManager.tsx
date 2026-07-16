import { useState, useMemo, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ToastAction } from "@/components/ui/toast";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Calendar, CalendarClock, ChevronLeft, ChevronRight, ChevronsLeftRight, Clock, Phone, Mail, User, Trash2, Filter, CheckSquare, ListChecks, StickyNote, ArrowUpDown } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { getLocalDateInputValue, isAppointmentWorkingDay, APPOINTMENT_TYPES } from "@shared/appointmentSchedule";
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

function getAppointmentNameClassName(status: string) {
  switch (status) {
    case 'pending':
      return 'font-bold text-foreground'
    case 'confirmed':
      return 'font-normal text-foreground'
    case 'cancelled':
      return 'font-normal line-through text-red-600 dark:text-red-400 opacity-60'
    case 'completed':
      return 'font-normal line-through text-green-700 dark:text-green-400'
    default:
      return 'font-medium text-foreground'
  }
}

type ManagerFilter = 'all' | 'new'
type AppointmentFilter = 'all' | 'new' | 'pending' | 'confirmed' | 'cancelled' | 'completed'
type AppointmentSortBy = 'date-asc' | 'date-desc' | 'booking-asc' | 'booking-desc' | 'name-asc' | 'child-first' | 'adult-first'
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
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<AppointmentSortBy>('date-asc')
  const [calendarView, setCalendarView] = useState<CalendarViewMode>('month')
  const [anchorDate, setAnchorDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  })
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null)
  const [pendingStatusChange, setPendingStatusChange] = useState<{ id: number; from: string; to: string } | null>(null)
  const [listWidthPercent, setListWidthPercent] = useState(50)
  const [isResizingList, setIsResizingList] = useState(false)
  const splitContainerRef = useRef<HTMLDivElement>(null)
  const isListCondensed = listWidthPercent < 25
  const [rescheduleDate, setRescheduleDate] = useState("")
  const [rescheduleTime, setRescheduleTime] = useState("")
  const [rescheduleAvailableTimes, setRescheduleAvailableTimes] = useState<string[]>([])
  const [noteText, setNoteText] = useState("")

  useEffect(() => {
    setFilter(initialFilter)
  }, [initialFilter])

  const { data: allAppointments = [], isLoading } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments"],
  });

  const appointments = useMemo(() => {
    const byStatus = filter === 'new'
      ? allAppointments.filter(a => a.status === 'pending') // pending/new bookings
      : filter === 'all'
        ? allAppointments
        : allAppointments.filter(a => a.status === filter)
    return typeFilter === 'all' ? byStatus : byStatus.filter(a => a.type === typeFilter)
  }, [allAppointments, filter, typeFilter]);

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string; previousStatus?: string }) => {
      await apiRequest("PATCH", `/api/appointments/${id}/status`, { status });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      queryClient.invalidateQueries({ queryKey: ["admin-badges"] });
      const { id, status, previousStatus } = variables;
      toast({
        title: isHe ? "הסטטוס עודכן" : "Status updated",
        description: isHe ? "סטטוס הפגישה עודכן בהצלחה." : "Appointment status has been updated successfully.",
        action: previousStatus && previousStatus !== status ? (
          <ToastAction
            altText={isHe ? "בטל שינוי" : "Undo change"}
            onClick={() => updateStatus.mutate({ id, status: previousStatus, previousStatus: status })}
          >
            {isHe ? "בטל" : "Undo"}
          </ToastAction>
        ) : undefined,
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

  const requestStatusChange = (appointment: Appointment, to: string) => {
    if (to === appointment.status) return;
    setPendingStatusChange({ id: appointment.id, from: appointment.status, to });
  };

  const confirmStatusChange = () => {
    if (!pendingStatusChange) return;
    updateStatus.mutate({ id: pendingStatusChange.id, status: pendingStatusChange.to, previousStatus: pendingStatusChange.from });
    setPendingStatusChange(null);
  };

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

  const renderHoverDetails = (appointment: Appointment) => {
    const statusInfo = STATUS_CONFIG[appointment.status] || STATUS_CONFIG.pending;
    const isForChild = (appointment as any).appointmentFor === "child";

    return (
      <div className="space-y-1.5 text-sm">
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold text-foreground flex items-center gap-1">
            <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            {appointment.clientName}
          </span>
          <Badge
            variant="secondary"
            className={`no-default-hover-elevate no-default-active-elevate shrink-0 text-xs ${statusInfo.color}`}
          >
            {isHe ? statusInfo.he : statusInfo.en}
          </Badge>
        </div>
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <Calendar className="h-3 w-3 shrink-0" />
          {formatAppointmentDate(appointment.date)} · {formatAppointmentTime(appointment.time)}
        </div>
        <div className="text-xs text-muted-foreground">{appointment.type}</div>
        {appointment.clientPhone && (
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Phone className="h-3 w-3 shrink-0" />
            {appointment.clientPhone}
          </div>
        )}
        {appointment.clientEmail && (
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Mail className="h-3 w-3 shrink-0" />
            {appointment.clientEmail}
          </div>
        )}
        {isForChild && appointment.childName && (
          <div className="text-xs text-muted-foreground">
            {isHe ? "עבור" : "For"}: {appointment.childName}
            {(appointment as any).childAge ? `, ${isHe ? "גיל" : "age"} ${(appointment as any).childAge}` : ""}
          </div>
        )}
        {appointment.notes && (
          <div className="text-xs text-muted-foreground border-t pt-1.5 mt-1.5">{appointment.notes}</div>
        )}
      </div>
    );
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

  const MIN_LIST_WIDTH_PERCENT = 14;
  const MAX_LIST_WIDTH_PERCENT = 65;

  const handleResizeStart = (e: React.PointerEvent) => {
    const container = splitContainerRef.current;
    if (!container || window.innerWidth < 1024) return;
    e.preventDefault();
    setIsResizingList(true);
    const startX = e.clientX;
    const startWidth = listWidthPercent;
    const containerWidth = container.getBoundingClientRect().width;

    const handleMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const signedDelta = isRTL ? -deltaX : deltaX;
      const deltaPercent = (signedDelta / containerWidth) * 100;
      const next = Math.min(MAX_LIST_WIDTH_PERCENT, Math.max(MIN_LIST_WIDTH_PERCENT, startWidth + deltaPercent));
      setListWidthPercent(next);
    };
    const handleUp = () => {
      setIsResizingList(false);
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
  };

  const selectedAppointment = selectedAppointmentId
    ? allAppointments.find((a) => a.id === selectedAppointmentId) || null
    : null;

  useEffect(() => {
    if (selectedAppointment) {
      setRescheduleDate(selectedAppointment.date)
      setRescheduleTime(selectedAppointment.time)
      setNoteText("")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAppointment?.id])

  useEffect(() => {
    if (!selectedAppointment || !rescheduleDate) {
      setRescheduleAvailableTimes([])
      return
    }
    let cancelled = false
    const params = new URLSearchParams({ date: rescheduleDate, type: selectedAppointment.type })
    fetch(`/api/appointments/availability?${params.toString()}`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { availableTimes?: string[] } | null) => {
        if (cancelled || !data) return
        let times = data.availableTimes || []
        if (rescheduleDate === selectedAppointment.date && !times.includes(selectedAppointment.time)) {
          times = [...times, selectedAppointment.time].sort()
        }
        setRescheduleAvailableTimes(times)
        setRescheduleTime((current) => (times.includes(current) ? current : ""))
      })
      .catch(() => {})
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rescheduleDate, selectedAppointment?.id, selectedAppointment?.type])

  const rescheduleMutation = useMutation({
    mutationFn: async ({ id, date, time }: { id: number; date: string; time: string }) => {
      await apiRequest("PATCH", `/api/appointments/${id}/reschedule`, { date, time });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      queryClient.invalidateQueries({ queryKey: ["admin-badges"] });
      toast({
        title: isHe ? "התאריך עודכן" : "Date updated",
        description: isHe ? "מועד הפגישה שונה בהצלחה." : "The appointment has been rescheduled successfully.",
      });
    },
    onError: () => {
      toast({
        title: isHe ? "שגיאה" : "Error",
        description: isHe ? "שינוי המועד נכשל. ייתכן שהשעה כבר תפוסה." : "Failed to reschedule. The time slot may already be booked.",
        variant: "destructive",
      });
    },
  });

  const addNoteMutation = useMutation({
    mutationFn: async ({ id, note }: { id: number; note: string }) => {
      await apiRequest("POST", `/api/appointments/${id}/note`, { note });
    },
    onSuccess: () => {
      setNoteText("")
      toast({
        title: isHe ? "ההערה נוספה" : "Note added",
        description: isHe ? "ההערה נוספה ליומן הפעילות של הליד/לקוח." : "The note was added to the lead/client's activity log.",
      });
    },
    onError: () => {
      toast({
        title: isHe ? "שגיאה" : "Error",
        description: isHe ? "הוספת ההערה נכשלה." : "Failed to add the note.",
        variant: "destructive",
      });
    },
  });

  const visibleAppointments = useMemo(() => {
    const sorted = [...appointments]
    switch (sortBy) {
      case 'date-desc':
        sorted.sort((a, b) => `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`))
        break
      case 'booking-asc':
        sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        break
      case 'booking-desc':
        sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'name-asc':
        sorted.sort((a, b) => a.clientName.localeCompare(b.clientName, isHe ? 'he' : 'en'))
        break
      case 'child-first':
        sorted.sort((a, b) => (a.appointmentFor === 'child' ? 0 : 1) - (b.appointmentFor === 'child' ? 0 : 1))
        break
      case 'adult-first':
        sorted.sort((a, b) => (a.appointmentFor === 'child' ? 1 : 0) - (b.appointmentFor === 'child' ? 1 : 0))
        break
      case 'date-asc':
      default:
        sorted.sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`))
    }
    return sorted
  }, [appointments, sortBy, isHe])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <CardTitle>{isHe ? "ניהול פגישות" : "Appointment Manager"}</CardTitle>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value)}>
              <SelectTrigger className="w-[150px] h-8 text-xs" data-testid="select-appointment-type-filter">
                <div className="flex items-center gap-1.5">
                  <ListChecks className="h-3.5 w-3.5" />
                  <SelectValue placeholder={isHe ? "סוג" : "Type"} />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isHe ? "כל הסוגים" : "All types"}</SelectItem>
                {APPOINTMENT_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{isHe ? t.he : t.en}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as AppointmentSortBy)}>
              <SelectTrigger className="w-[170px] h-8 text-xs" data-testid="select-appointment-sort">
                <div className="flex items-center gap-1.5">
                  <ArrowUpDown className="h-3.5 w-3.5" />
                  <SelectValue placeholder={isHe ? "מיון" : "Sort"} />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-asc">{isHe ? "תאריך פגישה (קרוב תחילה)" : "Appt. date (soonest)"}</SelectItem>
                <SelectItem value="date-desc">{isHe ? "תאריך פגישה (רחוק תחילה)" : "Appt. date (latest)"}</SelectItem>
                <SelectItem value="booking-desc">{isHe ? "תאריך קביעה (חדש תחילה)" : "Booking date (newest)"}</SelectItem>
                <SelectItem value="booking-asc">{isHe ? "תאריך קביעה (ישן תחילה)" : "Booking date (oldest)"}</SelectItem>
                <SelectItem value="name-asc">{isHe ? "שם (א-ת)" : "Name (A-Z)"}</SelectItem>
                <SelectItem value="child-first">{isHe ? "ילדים תחילה" : "Children first"}</SelectItem>
                <SelectItem value="adult-first">{isHe ? "מבוגרים תחילה" : "Adults first"}</SelectItem>
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
          <div
            ref={splitContainerRef}
            className="space-y-4 lg:space-y-0 lg:flex lg:items-stretch lg:gap-0"
          >
            <div
              className="lg:order-3 min-w-0 rounded-lg border bg-muted/20 p-2.5 sm:p-4 space-y-2.5 sm:space-y-3 overflow-hidden"
              style={{ flexBasis: `calc(${100 - listWidthPercent}% - 6px)` }}
              data-testid="appointments-calendar"
            >
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
                  <div className="grid grid-cols-[repeat(5,1fr)_repeat(2,0.5fr)] gap-0.5 sm:gap-1 text-center text-[10px] sm:text-xs font-medium text-muted-foreground">
                    {(isHe ? weekDaysHe : weekDaysEn).map((day) => (
                      <div key={day} className="py-1 truncate">{day}</div>
                    ))}
                  </div>

                  <div className="grid grid-cols-[repeat(5,1fr)_repeat(2,0.5fr)] gap-0.5 sm:gap-1">
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
                              <HoverCard key={appointment.id} openDelay={200}>
                                <HoverCardTrigger asChild>
                                  <button
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
                                </HoverCardTrigger>
                                <HoverCardContent side="right" align="start">
                                  {renderHoverDetails(appointment)}
                                </HoverCardContent>
                              </HoverCard>
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
                  <div className="grid grid-cols-[repeat(5,1fr)_repeat(2,0.5fr)] gap-0.5 sm:gap-1 text-center text-[10px] sm:text-xs font-medium text-muted-foreground">
                    {weekDays.map((day) => (
                      <div key={day.value} className="py-1 truncate">
                        {(isHe ? weekDaysHe : weekDaysEn)[day.date.getDay()]}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-[repeat(5,1fr)_repeat(2,0.5fr)] gap-0.5 sm:gap-1">
                    {weekDays.map((day) => (
                      <div
                        key={day.value}
                        className={cn(
                          "min-h-[650px] sm:min-h-[720px] md:min-h-[750px] rounded-md border p-1 sm:p-1.5 align-top overflow-y-auto",
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
                              <HoverCard key={appointment.id} openDelay={200}>
                                <HoverCardTrigger asChild>
                                  <button
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
                                </HoverCardTrigger>
                                <HoverCardContent side="right" align="start">
                                  {renderHoverDetails(appointment)}
                                </HoverCardContent>
                              </HoverCard>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {calendarView === "day" && (
                <div className="space-y-1.5 sm:space-y-2 min-h-[650px] sm:min-h-[720px] md:min-h-[750px]">
                  {dayViewAppointments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      {isHe ? "אין פגישות ביום זה" : "No appointments on this day"}
                    </div>
                  ) : (
                    dayViewAppointments.map((appointment) => {
                      const statusInfo = STATUS_CONFIG[appointment.status] || STATUS_CONFIG.pending;

                      return (
                        <HoverCard key={appointment.id} openDelay={200}>
                          <HoverCardTrigger asChild>
                            <button
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
                          </HoverCardTrigger>
                          <HoverCardContent side="right" align="start">
                            {renderHoverDetails(appointment)}
                          </HoverCardContent>
                        </HoverCard>
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

            <div
              role="separator"
              aria-orientation="vertical"
              onPointerDown={handleResizeStart}
              className={cn(
                "lg:order-2 hidden lg:flex w-3 shrink-0 cursor-col-resize items-center justify-center group",
                isResizingList && "select-none",
              )}
              title={isHe ? "גררו לשינוי רוחב" : "Drag to resize"}
              data-testid="resize-handle-list"
            >
              <div className={cn(
                "flex h-10 w-3 items-center justify-center rounded-full border bg-background text-muted-foreground transition-colors group-hover:bg-muted group-hover:text-foreground",
                isResizingList && "bg-muted text-foreground",
              )}>
                <ChevronsLeftRight className="h-3 w-3" />
              </div>
            </div>

            <div
              className="lg:order-1 min-w-0"
              style={{ flexBasis: `calc(${listWidthPercent}% - 6px)` }}
            >
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <ListChecks className="h-4 w-4 text-primary shrink-0" />
                <h3 className="font-semibold text-foreground text-sm sm:text-base">
                  {isHe ? "רשימת פגישות" : "Appointments list"}
                </h3>
              </div>
            </div>
            {visibleAppointments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground" data-testid="empty-appointments">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>{isHe ? "אין פגישות להצגה" : "No appointments to display"}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {visibleAppointments.map((appointment, index) => {
                  const statusInfo = STATUS_CONFIG[appointment.status] || STATUS_CONFIG.pending;

              if (isListCondensed) {
                return (
                  <HoverCard key={appointment.id} openDelay={200}>
                    <HoverCardTrigger asChild>
                      <button
                        type="button"
                        onClick={() => setSelectedAppointmentId(appointment.id)}
                        className={cn(
                          "block w-full border rounded-md p-1.5 space-y-0.5 text-left transition-opacity hover:opacity-80",
                          index % 2 === 0 ? "bg-amber-50/70 dark:bg-amber-950/10" : "bg-background",
                        )}
                        data-testid={`appointment-${appointment.id}`}
                      >
                        <div className={cn("text-[11px] truncate", getAppointmentNameClassName(appointment.status))}>{appointment.clientName}</div>
                        <div className="text-[10px] text-muted-foreground truncate">
                          {formatAppointmentDate(appointment.date)}
                        </div>
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] text-muted-foreground shrink-0">{formatAppointmentTime(appointment.time)}</span>
                          <Badge
                            variant="secondary"
                            className={`no-default-hover-elevate no-default-active-elevate text-[9px] leading-tight px-1 py-0 truncate ${statusInfo.color}`}
                          >
                            {appointment.type}
                          </Badge>
                        </div>
                      </button>
                    </HoverCardTrigger>
                    <HoverCardContent side="left" align="start">
                      {renderHoverDetails(appointment)}
                    </HoverCardContent>
                  </HoverCard>
                );
              }

              return (
                <div
                  key={appointment.id}
                  className={cn("border rounded-lg p-4 space-y-3", index % 2 === 0 ? "bg-amber-50/70 dark:bg-amber-950/10" : "bg-background")}
                  data-testid={`appointment-${appointment.id}`}
                >
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <HoverCard openDelay={200}>
                        <HoverCardTrigger asChild>
                          <span className={cn("flex items-center gap-1 cursor-default", getAppointmentNameClassName(appointment.status))} data-testid={`hover-appointment-${appointment.id}`}>
                            <User className="w-3.5 h-3.5 text-muted-foreground" />
                            {appointment.clientName}
                          </span>
                        </HoverCardTrigger>
                        <HoverCardContent side="top" align="start">
                          {renderHoverDetails(appointment)}
                        </HoverCardContent>
                      </HoverCard>
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
                        onValueChange={(status) => requestStatusChange(appointment, status)}
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
        <DialogContent className="max-w-md" dir={isHe ? "rtl" : "ltr"}>
          {selectedAppointment && (() => {
            const statusInfo = STATUS_CONFIG[selectedAppointment.status] || STATUS_CONFIG.pending;
            const rescheduleUnchanged = rescheduleDate === selectedAppointment.date && rescheduleTime === selectedAppointment.time;

            return (
              <>
                <DialogHeader className="text-center sm:text-start">
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

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Select
                      value={selectedAppointment.status}
                      onValueChange={(status) => requestStatusChange(selectedAppointment, status)}
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

                  <div className="space-y-2 border-t pt-3">
                    <Label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                      <CalendarClock className="h-3.5 w-3.5" />
                      {isHe ? "שינוי תאריך ושעה" : "Reschedule"}
                    </Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={rescheduleDate}
                        min={getLocalDateInputValue()}
                        onChange={(e) => setRescheduleDate(e.target.value)}
                        className="h-8 flex-1 min-w-0 rounded-md border bg-background px-2 text-xs"
                        data-testid="input-reschedule-date"
                      />
                      <Select value={rescheduleTime} onValueChange={setRescheduleTime}>
                        <SelectTrigger className="h-8 text-xs w-[110px] shrink-0" data-testid="select-reschedule-time">
                          <SelectValue placeholder={isHe ? "שעה" : "Time"} />
                        </SelectTrigger>
                        <SelectContent>
                          {rescheduleAvailableTimes.map((t) => (
                            <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {rescheduleDate && rescheduleAvailableTimes.length === 0 && (
                      <p className="text-xs text-destructive">
                        {isHe ? "אין שעות פנויות בתאריך זה עבור סוג פגישה זה." : "No available times on this date for this appointment type."}
                      </p>
                    )}
                    <Button
                      size="sm"
                      className="w-full"
                      disabled={rescheduleMutation.isPending || !rescheduleDate || !rescheduleTime || rescheduleUnchanged}
                      onClick={() => rescheduleMutation.mutate({ id: selectedAppointment.id, date: rescheduleDate, time: rescheduleTime })}
                      data-testid="button-save-reschedule"
                    >
                      {isHe ? "שמירת מועד חדש" : "Save new date"}
                    </Button>
                  </div>

                  <div className="space-y-2 border-t pt-3">
                    <Label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                      <StickyNote className="h-3.5 w-3.5" />
                      {isHe ? "הוספת הערה" : "Add a note"}
                    </Label>
                    <Textarea
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder={isHe ? "ההערה תתווסף ליומן הפעילות של הליד/לקוח" : "This note will be added to the lead/client's activity log"}
                      className="text-xs min-h-[60px]"
                      data-testid="textarea-appointment-note"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      disabled={addNoteMutation.isPending || !noteText.trim()}
                      onClick={() => addNoteMutation.mutate({ id: selectedAppointment.id, note: noteText.trim() })}
                      data-testid="button-add-appointment-note"
                    >
                      {isHe ? "הוספת הערה" : "Add note"}
                    </Button>
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!pendingStatusChange} onOpenChange={(open) => !open && setPendingStatusChange(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{isHe ? "שינוי סטטוס פגישה" : "Change appointment status"}</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingStatusChange && (
                isHe
                  ? `הסטטוס ישונה מ"${STATUS_CONFIG[pendingStatusChange.from]?.he ?? pendingStatusChange.from}" ל"${STATUS_CONFIG[pendingStatusChange.to]?.he ?? pendingStatusChange.to}". להמשיך?`
                  : `The status will change from "${STATUS_CONFIG[pendingStatusChange.from]?.en ?? pendingStatusChange.from}" to "${STATUS_CONFIG[pendingStatusChange.to]?.en ?? pendingStatusChange.to}". Continue?`
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-status-change">{isHe ? "ביטול" : "Cancel"}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmStatusChange} data-testid="button-confirm-status-change">
              {isHe ? "אישור" : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default AppointmentsManager;
