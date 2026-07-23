import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, CalendarClock, Plus, X, StickyNote, XCircle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { AppointmentForFields, type AppointmentFor } from "@/components/AppointmentForFields";
import { APPOINTMENT_TYPES, getLocalDateInputValue } from "@shared/appointmentSchedule";
import { fetchAppointmentAvailability, getAppointmentSubmitError } from "@/lib/appointmentAvailability";
import type { Appointment, Client } from "@shared/schema";
import { useAdminUndo } from "@/hooks/useAdminUndo";

const STATUS_BADGE: Record<string, { he: string; en: string; color: string }> = {
  pending: { he: "ממתינה", en: "Pending", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" },
  confirmed: { he: "מאושרת", en: "Confirmed", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
};

const CANCEL_CONTACT_METHODS: { value: string; he: string; en: string }[] = [
  { value: "phone", he: "שיחת טלפון", en: "Phone call" },
  { value: "whatsapp", he: "הודעת WhatsApp", en: "WhatsApp message" },
  { value: "email", he: "אימייל", en: "Email" },
  { value: "in_person", he: "הגעה אישית", en: "In person" },
  { value: "other", he: "אחר", en: "Other" },
];

function getAppointmentTypeLabel(type: string, isHe: boolean) {
  const found = APPOINTMENT_TYPES.find((t) => t.value === type);
  return found ? (isHe ? found.he : found.en) : type;
}

function formatAppointmentDate(date: string, isHe: boolean) {
  const [y, m, d] = date.split("-").map(Number);
  const parsed = y && m && d ? new Date(y, m - 1, d) : new Date(date);
  return parsed.toLocaleDateString(isHe ? "he-IL" : "en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" });
}

interface SchedulerFormProps {
  client: Client;
  isHe: boolean;
  onDone: () => void;
}

function SchedulerForm({ client, isHe, onDone }: SchedulerFormProps) {
  const { toast } = useToast();
  const [type, setType] = useState<string>(APPOINTMENT_TYPES[0]?.value || "consultation");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [appointmentFor, setAppointmentFor] = useState<AppointmentFor>(client.childName ? "child" : "self");
  const [childName, setChildName] = useState(client.childName || "");
  const [childAge, setChildAge] = useState<number | "">("");
  const [notes, setNotes] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!date) {
      setAvailableTimes([]);
      return;
    }
    let cancelled = false;
    fetchAppointmentAvailability(date, type)
      .then((data) => {
        if (cancelled) return;
        const times = data.availableTimes || [];
        setAvailableTimes(times);
        setTime((current) => (times.includes(current) ? current : ""));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [date, type]);

  const forReady = appointmentFor === "self" || (!!childName.trim() && childAge !== "" && childAge >= 6);
  const clientReady = !!(client.email || email.trim()) && !!(client.phone || phone.trim());
  const canSubmit = forReady && clientReady && !!date && !!time && !submitting;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload: Record<string, any> = {
        clientId: client.id,
        date,
        time,
        type,
        appointmentFor,
        childName: appointmentFor === "child" ? childName.trim() : undefined,
        childAge: appointmentFor === "child" ? childAge : undefined,
        notes: notes.trim() || undefined,
      };
      if (email.trim()) payload.email = email.trim();
      if (phone.trim()) payload.phone = phone.trim();
      await apiRequest("POST", "/api/appointments/manual", payload);
      toast({
        title: isHe ? "הפגישה נקבעה" : "Appointment created",
        description: isHe ? "הפגישה נוספה בהצלחה." : "The appointment was added successfully.",
      });
      onDone();
    } catch (error) {
      toast({ title: isHe ? "שגיאה" : "Error", description: getAppointmentSubmitError(error, isHe), variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label className="text-xs">{isHe ? "סוג פגישה" : "Appointment type"}</Label>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="h-8 text-xs" data-testid="select-panel-appt-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {APPOINTMENT_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value} className="text-xs">
                {isHe ? t.he : t.en}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <AppointmentForFields
        isHe={isHe}
        appointmentFor={appointmentFor}
        childName={childName}
        childAge={childAge}
        onAppointmentForChange={setAppointmentFor}
        onChildNameChange={setChildName}
        onChildAgeChange={setChildAge}
      />

      {!client.email && (
        <div className="space-y-1">
          <Label htmlFor="panel-appt-email" className="text-xs">{isHe ? "אימייל (חובה)" : "Email (required)"}</Label>
          <Input id="panel-appt-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-8 text-xs" data-testid="input-panel-appt-email" />
        </div>
      )}
      {!client.phone && (
        <div className="space-y-1">
          <Label htmlFor="panel-appt-phone" className="text-xs">{isHe ? "טלפון (חובה)" : "Phone (required)"}</Label>
          <Input id="panel-appt-phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-8 text-xs" data-testid="input-panel-appt-phone" />
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label htmlFor="panel-appt-date" className="text-xs">{isHe ? "תאריך" : "Date"}</Label>
          <Input id="panel-appt-date" type="date" value={date} min={getLocalDateInputValue()} onChange={(e) => setDate(e.target.value)} className="h-8 text-xs" data-testid="input-panel-appt-date" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">{isHe ? "שעה" : "Time"}</Label>
          <Select value={time} onValueChange={setTime} disabled={!date || availableTimes.length === 0}>
            <SelectTrigger className="h-8 text-xs" data-testid="select-panel-appt-time">
              <SelectValue placeholder={isHe ? "בחר/י שעה" : "Select time"} />
            </SelectTrigger>
            <SelectContent>
              {availableTimes.map((t) => (
                <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {date && availableTimes.length === 0 && (
        <p className="text-xs text-destructive">{isHe ? "אין שעות פנויות בתאריך זה." : "No available times on this date."}</p>
      )}

      <div className="space-y-1">
        <Label htmlFor="panel-appt-notes" className="text-xs">{isHe ? "הערות (אופציונלי)" : "Notes (optional)"}</Label>
        <Textarea id="panel-appt-notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="text-xs" rows={2} data-testid="textarea-panel-appt-notes" />
      </div>

      <Button className="w-full" size="sm" disabled={!canSubmit} onClick={handleSubmit} data-testid="button-panel-appt-submit">
        {submitting ? (isHe ? "קובע..." : "Creating...") : (isHe ? "קביעת פגישה" : "Create appointment")}
      </Button>
    </div>
  );
}

interface AppointmentCardProps {
  appointment: Appointment;
  canManage: boolean;
  isHe: boolean;
  onChanged: () => void;
}

function AppointmentCard({ appointment, canManage, isHe, onChanged }: AppointmentCardProps) {
  const { toast } = useToast();
  const pushUndo = useAdminUndo();
  const [mode, setMode] = useState<"view" | "reschedule" | "cancel" | "note">("view");
  const [rescheduleDate, setRescheduleDate] = useState(appointment.date);
  const [rescheduleTime, setRescheduleTime] = useState(appointment.time);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [cancelMethod, setCancelMethod] = useState("");
  const [noteText, setNoteText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (mode !== "reschedule" || !rescheduleDate) {
      setAvailableTimes([]);
      return;
    }
    let cancelled = false;
    fetchAppointmentAvailability(rescheduleDate, appointment.type)
      .then((data) => {
        if (cancelled) return;
        let times = data.availableTimes || [];
        if (rescheduleDate === appointment.date && !times.includes(appointment.time)) {
          times = [...times, appointment.time].sort();
        }
        setAvailableTimes(times);
        setRescheduleTime((current) => (times.includes(current) ? current : ""));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [mode, rescheduleDate, appointment.type, appointment.date, appointment.time]);

  const resetMode = () => {
    setMode("view");
    setCancelMethod("");
    setNoteText("");
  };

  const handleReschedule = async () => {
    if (!rescheduleDate || !rescheduleTime) return;
    setSubmitting(true);
    try {
      await apiRequest("PATCH", `/api/appointments/${appointment.id}/reschedule`, { date: rescheduleDate, time: rescheduleTime });
      toast({ title: isHe ? "התאריך עודכן" : "Date updated", description: isHe ? "מועד הפגישה שונה בהצלחה." : "The appointment has been rescheduled." });
      resetMode();
      onChanged();
    } catch {
      toast({
        title: isHe ? "שגיאה" : "Error",
        description: isHe ? "שינוי המועד נכשל. ייתכן שהשעה כבר תפוסה." : "Failed to reschedule. The time slot may already be booked.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelMethod) return;
    const previousStatus = appointment.status;
    setSubmitting(true);
    try {
      await apiRequest("PATCH", `/api/appointments/${appointment.id}/status`, { status: "cancelled", contactMethod: cancelMethod });
      pushUndo({
        title: isHe ? "הפגישה בוטלה" : "Appointment cancelled",
        description: isHe ? "אפשר לבטל עם Ctrl+Z." : "Press Ctrl+Z to undo.",
        undoLabel: isHe ? "בטל" : "Undo",
        undoSuccessTitle: isHe ? "ביטול הפגישה שוחזר" : "Appointment cancellation undone",
        undoErrorTitle: isHe ? "ביטול השחזור נכשל" : "Failed to undo cancellation",
        onUndo: async () => {
          await apiRequest("PATCH", `/api/appointments/${appointment.id}/status`, { status: previousStatus });
          onChanged();
        },
      });
      resetMode();
      onChanged();
    } catch {
      toast({ title: isHe ? "שגיאה" : "Error", description: isHe ? "ביטול הפגישה נכשל." : "Failed to cancel the appointment.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleComplete = async () => {
    const previousStatus = appointment.status;
    setSubmitting(true);
    try {
      await apiRequest("PATCH", `/api/appointments/${appointment.id}/status`, { status: "completed" });
      pushUndo({
        title: isHe ? "הפגישה סומנה כהושלמה" : "Appointment marked complete",
        description: isHe ? "אפשר לבטל עם Ctrl+Z." : "Press Ctrl+Z to undo.",
        undoLabel: isHe ? "בטל" : "Undo",
        undoSuccessTitle: isHe ? "סטטוס הפגישה שוחזר" : "Appointment status restored",
        undoErrorTitle: isHe ? "שחזור הסטטוס נכשל" : "Failed to restore status",
        onUndo: async () => {
          await apiRequest("PATCH", `/api/appointments/${appointment.id}/status`, { status: previousStatus });
          onChanged();
        },
      });
      onChanged();
    } catch {
      toast({ title: isHe ? "שגיאה" : "Error", description: isHe ? "העדכון נכשל." : "Failed to update.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    setSubmitting(true);
    try {
      await apiRequest("POST", `/api/appointments/${appointment.id}/note`, { note: noteText.trim() });
      toast({ title: isHe ? "ההערה נוספה" : "Note added" });
      resetMode();
      onChanged();
    } catch {
      toast({ title: isHe ? "שגיאה" : "Error", description: isHe ? "הוספת ההערה נכשלה." : "Failed to add the note.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const statusInfo = STATUS_BADGE[appointment.status] || STATUS_BADGE.pending;
  const isPast = appointment.date <= getLocalDateInputValue();

  return (
    <div className="rounded-lg border p-3 space-y-2 bg-background" data-testid={`appointment-card-${appointment.id}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 text-sm font-medium">
            <CalendarClock className="w-3.5 h-3.5 text-muted-foreground" />
            {formatAppointmentDate(appointment.date, isHe)} · {appointment.time.slice(0, 5)}
          </div>
          <div className="text-xs text-muted-foreground">{getAppointmentTypeLabel(appointment.type, isHe)}</div>
          {appointment.appointmentFor === "child" && appointment.childName && (
            <div className="text-xs text-muted-foreground">
              {isHe ? "עבור" : "For"}: {appointment.childName}
              {appointment.childAge ? `, ${isHe ? "גיל" : "age"} ${appointment.childAge}` : ""}
            </div>
          )}
          {appointment.notes && <div className="text-xs text-muted-foreground border-t pt-1 mt-1">{appointment.notes}</div>}
        </div>
        <Badge variant="secondary" className={`no-default-hover-elevate no-default-active-elevate shrink-0 text-xs ${statusInfo.color}`}>
          {isHe ? statusInfo.he : statusInfo.en}
        </Badge>
      </div>

      {canManage && mode === "view" && (
        <div className="flex items-center gap-1 flex-wrap pt-1">
          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setMode("reschedule")} data-testid={`button-reschedule-${appointment.id}`}>
            {isHe ? "שינוי מועד" : "Reschedule"}
          </Button>
          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setMode("note")} data-testid={`button-add-note-${appointment.id}`}>
            <StickyNote className="w-3 h-3" />
            <span className="ml-1">{isHe ? "הוספת הערה" : "Add note"}</span>
          </Button>
          {isPast && (
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={handleComplete} disabled={submitting} data-testid={`button-complete-${appointment.id}`}>
              <CheckCircle2 className="w-3 h-3" />
              <span className="ml-1">{isHe ? "סימון כהושלמה" : "Mark complete"}</span>
            </Button>
          )}
          <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive" onClick={() => setMode("cancel")} data-testid={`button-cancel-${appointment.id}`}>
            <XCircle className="w-3 h-3" />
            <span className="ml-1">{isHe ? "ביטול" : "Cancel"}</span>
          </Button>
        </div>
      )}

      {mode === "reschedule" && (
        <div className="border-t pt-2 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">{isHe ? "תאריך" : "Date"}</Label>
              <Input
                type="date"
                value={rescheduleDate}
                min={getLocalDateInputValue()}
                onChange={(e) => setRescheduleDate(e.target.value)}
                className="h-8 text-xs"
                data-testid={`input-reschedule-date-${appointment.id}`}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{isHe ? "שעה" : "Time"}</Label>
              <Select value={rescheduleTime} onValueChange={setRescheduleTime} disabled={availableTimes.length === 0}>
                <SelectTrigger className="h-8 text-xs" data-testid={`select-reschedule-time-${appointment.id}`}>
                  <SelectValue placeholder={isHe ? "בחר/י שעה" : "Select time"} />
                </SelectTrigger>
                <SelectContent>
                  {availableTimes.map((t) => (
                    <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" className="h-7 text-xs" disabled={!rescheduleDate || !rescheduleTime || submitting} onClick={handleReschedule} data-testid={`button-confirm-reschedule-${appointment.id}`}>
              {isHe ? "שמירה" : "Save"}
            </Button>
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={resetMode}>{isHe ? "ביטול" : "Cancel"}</Button>
          </div>
        </div>
      )}

      {mode === "cancel" && (
        <div className="border-t pt-2 space-y-2">
          <Label className="text-xs">{isHe ? "כיצד עודכן הפונה?" : "How was the client informed?"}</Label>
          <Select value={cancelMethod} onValueChange={setCancelMethod}>
            <SelectTrigger className="h-8 text-xs" data-testid={`select-cancel-method-${appointment.id}`}>
              <SelectValue placeholder={isHe ? "בחר/י" : "Select"} />
            </SelectTrigger>
            <SelectContent>
              {CANCEL_CONTACT_METHODS.map((m) => (
                <SelectItem key={m.value} value={m.value} className="text-xs">{isHe ? m.he : m.en}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="destructive" className="h-7 text-xs" disabled={!cancelMethod || submitting} onClick={handleCancel} data-testid={`button-confirm-cancel-${appointment.id}`}>
              {isHe ? "אישור ביטול" : "Confirm cancel"}
            </Button>
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={resetMode}>{isHe ? "חזרה" : "Back"}</Button>
          </div>
        </div>
      )}

      {mode === "note" && (
        <div className="border-t pt-2 space-y-2">
          <Textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder={isHe ? "הערה..." : "Note..."}
            className="text-xs"
            rows={2}
            data-testid={`textarea-appointment-note-${appointment.id}`}
          />
          <div className="flex items-center gap-2">
            <Button size="sm" className="h-7 text-xs" disabled={!noteText.trim() || submitting} onClick={handleAddNote} data-testid={`button-submit-appointment-note-${appointment.id}`}>
              {isHe ? "הוספה" : "Add"}
            </Button>
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={resetMode}>{isHe ? "ביטול" : "Cancel"}</Button>
          </div>
        </div>
      )}
    </div>
  );
}

interface AppointmentPanelProps {
  client: Client;
  appointments: Appointment[];
  canManage: boolean;
  isHe: boolean;
  onChanged: () => void;
}

const AppointmentPanel = ({ client, appointments, canManage, isHe, onChanged }: AppointmentPanelProps) => {
  const today = getLocalDateInputValue();

  const upcoming = useMemo(() => {
    return appointments
      .filter((a) => (a.status === "pending" || a.status === "confirmed") && a.date >= today)
      .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));
  }, [appointments, today]);

  const [schedulerOpen, setSchedulerOpen] = useState(false);

  return (
    <Card data-testid="card-appointment-panel">
      <CardContent className="pt-6 space-y-3">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          {isHe ? "פגישות" : "Appointments"}
        </h4>

        {upcoming.length === 0 ? (
          canManage ? (
            <>
              <p className="text-sm text-muted-foreground">{isHe ? "אין פגישות קרובות" : "No upcoming appointments"}</p>
              <SchedulerForm client={client} isHe={isHe} onDone={onChanged} />
            </>
          ) : (
            <p className="text-sm text-muted-foreground" data-testid="text-no-appointments">
              {isHe ? "אין פגישות קרובות. יש לפנות למנהל/ת לקביעת פגישה." : "No upcoming appointments. Contact a manager to schedule one."}
            </p>
          )
        ) : (
          <div className="space-y-2">
            {upcoming.map((appt) => (
              <AppointmentCard key={appt.id} appointment={appt} canManage={canManage} isHe={isHe} onChanged={onChanged} />
            ))}
          </div>
        )}

        {upcoming.length > 0 && canManage && (
          schedulerOpen ? (
            <div className="border-t pt-3 space-y-2">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-semibold text-muted-foreground">{isHe ? "פגישה נוספת" : "Another appointment"}</h5>
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setSchedulerOpen(false)} data-testid="button-close-another-appt">
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
              <SchedulerForm
                client={client}
                isHe={isHe}
                onDone={() => {
                  setSchedulerOpen(false);
                  onChanged();
                }}
              />
            </div>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setSchedulerOpen(true)} data-testid="button-schedule-another">
              <Plus className="w-4 h-4" />
              <span className="ml-1">{isHe ? "קביעת פגישה נוספת" : "Schedule another appointment"}</span>
            </Button>
          )
        )}
      </CardContent>
    </Card>
  );
};

export default AppointmentPanel;
