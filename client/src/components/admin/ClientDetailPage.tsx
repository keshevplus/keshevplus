import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowLeft, ArrowRight, Mail, Phone, StickyNote, PhoneCall, Calendar, DollarSign, MailOpen,
  MessageCircle, FileText, ClipboardList, UserCheck, ArrowRightLeft, Save, Plus, ChevronDown, ChevronUp,
  XCircle, Filter, Receipt, Trash2, Paperclip, Upload, Download,
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "../auth/AuthProvider";
import { useLanguage } from "@/hooks/useLanguage";
import AppointmentPanel from "./AppointmentPanel";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { getLocalDateInputValue } from "@shared/appointmentSchedule";
import { CLIENT_FILE_ALLOWED_TYPES, CLIENT_FILE_MAX_SIZE_BYTES } from "@shared/schema";
import type { Client, ClientActivity, ClientPayment, ClientFile, Contact, Appointment, QuestionnaireSubmission, Conversation, WhatsAppMessage } from "@shared/schema";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const PAYMENT_METHOD_LABELS: Record<string, { he: string; en: string }> = {
  cash: { he: "מזומן", en: "Cash" },
  card: { he: "כרטיס אשראי", en: "Card" },
  bank_transfer: { he: "העברה בנקאית", en: "Bank transfer" },
  bit: { he: "ביט", en: "Bit" },
  check: { he: "צ'ק", en: "Check" },
  other: { he: "אחר", en: "Other" },
};

const PAYMENT_STATUS_CONFIG: Record<string, { he: string; en: string; color: string }> = {
  paid: { he: "שולם", en: "Paid", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
  pending: { he: "ממתין", en: "Pending", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" },
  unpaid: { he: "לא שולם", en: "Unpaid", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
};

function calculateAge(dob?: string | null): number | null {
  if (!dob) return null;
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function formatWhatsAppUrl(phone: string, message?: string) {
  const cleaned = phone.replace(/[^0-9+]/g, '').replace(/^0/, '972')
  const params = message ? `?text=${encodeURIComponent(message)}` : ''
  return `https://wa.me/${cleaned}${params}`
}

interface ClientInteractions {
  contacts: Contact[];
  appointments: Appointment[];
  questionnaires: QuestionnaireSubmission[];
  conversations: Conversation[];
  whatsappMessages: WhatsAppMessage[];
}

interface GroupedInteraction {
  type: 'contact' | 'appointment' | 'questionnaire' | 'conversation' | 'whatsapp';
  date: Date;
  item: Contact | Appointment | QuestionnaireSubmission | Conversation | WhatsAppMessage;
}

const ACTIVITY_TYPES: Record<string, { he: string; en: string; color: string; icon: typeof StickyNote }> = {
  note: { he: "הערה", en: "Note", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300", icon: StickyNote },
  call: { he: "שיחה", en: "Call", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300", icon: PhoneCall },
  meeting: { he: "פגישה", en: "Meeting", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300", icon: Calendar },
  sale: { he: "מכירה", en: "Sale", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300", icon: DollarSign },
  email: { he: 'דוא"ל', en: "Email", color: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300", icon: MailOpen },
  appointment: { he: "פגישה נקבעה", en: "Appointment booked", color: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300", icon: Calendar },
  cancellation: { he: "ביטול פגישה", en: "Appointment cancelled", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300", icon: XCircle },
};

const SOURCE_LABELS: Record<string, { he: string; en: string }> = {
  contact_form: { he: "טופס יצירת קשר", en: "Contact Form" },
  appointment: { he: "קביעת תור", en: "Appointment" },
  questionnaire: { he: "שאלון", en: "Questionnaire" },
  chat: { he: "צ'אט", en: "Chat" },
  manual: { he: "ידני", en: "Manual" },
};

const INTERACTION_CONFIG = {
  contact: { he: "פנייה", en: "Contact", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300", icon: Mail },
  appointment: { he: "תור", en: "Appointment", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300", icon: Calendar },
  questionnaire: { he: "שאלון", en: "Questionnaire", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300", icon: ClipboardList },
  conversation: { he: "צ'אט", en: "Chat", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300", icon: MessageCircle },
  whatsapp: { he: "וואטסאפ", en: "WhatsApp", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300", icon: Phone },
};

function groupInteractions(inter: ClientInteractions): GroupedInteraction[] {
  const items: GroupedInteraction[] = [];
  inter.contacts.forEach(c => items.push({ type: 'contact', date: new Date(c.createdAt), item: c }));
  inter.appointments.forEach(a => items.push({ type: 'appointment', date: new Date(a.createdAt), item: a }));
  inter.questionnaires.forEach(q => items.push({ type: 'questionnaire', date: new Date(q.createdAt), item: q }));
  inter.conversations.forEach(cv => items.push({ type: 'conversation', date: new Date(cv.createdAt), item: cv }));
  inter.whatsappMessages.forEach(wm => items.push({ type: 'whatsapp', date: new Date(wm.createdAt), item: wm }));
  items.sort((a, b) => b.date.getTime() - a.date.getTime());
  return items;
}

interface ClientDetailPageProps {
  clientId: number;
  onBack: () => void;
}

const ClientDetailPage = ({ clientId, onBack }: ClientDetailPageProps) => {
  const { language, isRTL } = useLanguage();
  const isHe = language === "he";
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();
  const isBillingOnly = user?.role === "billing";

  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<ClientActivity[]>([]);
  const [interactions, setInteractions] = useState<ClientInteractions | null>(null);
  const [activitiesLoading, setActivitiesLoading] = useState(false);

  const [editNotes, setEditNotes] = useState("");
  const [activityType, setActivityType] = useState("note");
  const [activityDesc, setActivityDesc] = useState("");
  const [activityMeta, setActivityMeta] = useState("");

  const [showMoreDetails, setShowMoreDetails] = useState(false);
  const [editDob, setEditDob] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editGender, setEditGender] = useState("");
  const [editIsDiagnosed, setEditIsDiagnosed] = useState("");
  const [activityLogExpanded, setActivityLogExpanded] = useState(false);
  const [activityFilter, setActivityFilter] = useState<string>("all");

  const [payments, setPayments] = useState<ClientPayment[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [newPaymentDate, setNewPaymentDate] = useState(getLocalDateInputValue());
  const [newPaymentAmount, setNewPaymentAmount] = useState("");
  const [newPaymentDescription, setNewPaymentDescription] = useState("");
  const [newPaymentMethod, setNewPaymentMethod] = useState("cash");
  const [newPaymentStatus, setNewPaymentStatus] = useState("paid");
  const [newPaymentInvoiceNumber, setNewPaymentInvoiceNumber] = useState("");
  const [addingPayment, setAddingPayment] = useState(false);

  const [files, setFiles] = useState<ClientFile[]>([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  const fetchClient = async () => {
    try {
      const res = await fetch(`/api/clients/${clientId}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch client");
      const data = await res.json();
      setClient(data);
      setEditNotes(data.notes || "");
      setEditDob(data.dateOfBirth || "");
      setEditCity(data.city || "");
      setEditGender(data.gender || "");
      setEditIsDiagnosed(data.isDiagnosed === true ? "yes" : data.isDiagnosed === false ? "no" : "");
      if (!data.adminSeen) {
        fetch(`/api/clients/${data.id}/seen`, { method: "PATCH", credentials: "include" })
          .then(() => queryClient.invalidateQueries({ queryKey: ["admin-badges"] }))
          .catch(() => {});
      }
    } catch {
      setClient(null);
      toast({ title: isHe ? "שגיאה" : "Error", description: isHe ? "טעינת הליד/לקוח נכשלה" : "Failed to load lead/client", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    setActivitiesLoading(true);
    try {
      const res = await fetch(`/api/clients/${clientId}/activities`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch activities");
      const data = await res.json();
      const sorted = data.sort((a: ClientActivity, b: ClientActivity) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setActivities(sorted);
    } catch {
      setActivities([]);
    } finally {
      setActivitiesLoading(false);
    }
  };

  const fetchInteractions = async () => {
    try {
      const res = await fetch(`/api/clients/${clientId}/interactions`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch interactions");
      const data = await res.json();
      setInteractions(data);
    } catch {
      setInteractions(null);
    }
  };

  const fetchPayments = async () => {
    setPaymentsLoading(true);
    try {
      const res = await fetch(`/api/clients/${clientId}/payments`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch payments");
      const data = await res.json();
      setPayments(data);
    } catch {
      setPayments([]);
    } finally {
      setPaymentsLoading(false);
    }
  };

  const handleAddPayment = async () => {
    const amountNum = Number(newPaymentAmount);
    if (!newPaymentDate || !newPaymentAmount || Number.isNaN(amountNum) || amountNum <= 0) {
      toast({ title: isHe ? "שגיאה" : "Error", description: isHe ? "יש להזין תאריך וסכום תקין" : "Please enter a date and a valid amount", variant: "destructive" });
      return;
    }
    setAddingPayment(true);
    try {
      await apiRequest("POST", `/api/clients/${clientId}/payments`, {
        date: newPaymentDate,
        amount: newPaymentAmount,
        description: newPaymentDescription.trim() || null,
        method: newPaymentMethod || null,
        status: newPaymentStatus,
        invoiceNumber: newPaymentInvoiceNumber.trim() || null,
      });
      toast({ title: isHe ? "הרישום נוסף" : "Record added", description: isHe ? "רישום התשלום נוסף בהצלחה" : "Payment record added successfully" });
      setNewPaymentDate(getLocalDateInputValue());
      setNewPaymentAmount("");
      setNewPaymentDescription("");
      setNewPaymentMethod("cash");
      setNewPaymentStatus("paid");
      setNewPaymentInvoiceNumber("");
      fetchPayments();
    } catch {
      toast({ title: isHe ? "שגיאה" : "Error", description: isHe ? "הוספת הרישום נכשלה" : "Failed to add the record", variant: "destructive" });
    } finally {
      setAddingPayment(false);
    }
  };

  const handleDeletePayment = async (paymentId: number) => {
    try {
      await apiRequest("DELETE", `/api/clients/payments/${paymentId}`);
      setPayments((prev) => prev.filter((p) => p.id !== paymentId));
    } catch {
      toast({ title: isHe ? "שגיאה" : "Error", description: isHe ? "מחיקת הרישום נכשלה" : "Failed to delete the record", variant: "destructive" });
    }
  };

  const fetchFiles = async () => {
    setFilesLoading(true);
    try {
      const res = await fetch(`/api/clients/${clientId}/files`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch files");
      const data = await res.json();
      setFiles(data);
    } catch {
      setFiles([]);
    } finally {
      setFilesLoading(false);
    }
  };

  const handleUploadFile = async (fileList: FileList | null) => {
    const file = fileList?.[0];
    if (!file) return;
    if (!(CLIENT_FILE_ALLOWED_TYPES as readonly string[]).includes(file.type)) {
      toast({ title: isHe ? "שגיאה" : "Error", description: isHe ? "סוג הקובץ אינו נתמך" : "This file type isn't supported", variant: "destructive" });
      return;
    }
    if (file.size > CLIENT_FILE_MAX_SIZE_BYTES) {
      toast({ title: isHe ? "שגיאה" : "Error", description: isHe ? "הקובץ גדול מדי (מקסימום 8MB)" : "File is too large (max 8MB)", variant: "destructive" });
      return;
    }
    setUploadingFile(true);
    try {
      const dataBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(",")[1] || "");
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
      await apiRequest("POST", `/api/clients/${clientId}/files`, {
        fileName: file.name,
        fileType: file.type,
        dataBase64,
      });
      toast({ title: isHe ? "הקובץ הועלה" : "File uploaded", description: isHe ? "הקובץ הועלה בהצלחה" : "File uploaded successfully" });
      fetchFiles();
    } catch {
      toast({ title: isHe ? "שגיאה" : "Error", description: isHe ? "העלאת הקובץ נכשלה" : "Failed to upload the file", variant: "destructive" });
    } finally {
      setUploadingFile(false);
    }
  };

  const handleDeleteFile = async (fileId: number) => {
    try {
      await apiRequest("DELETE", `/api/clients/files/${fileId}`);
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
    } catch {
      toast({ title: isHe ? "שגיאה" : "Error", description: isHe ? "מחיקת הקובץ נכשלה" : "Failed to delete the file", variant: "destructive" });
    }
  };

  useEffect(() => {
    setLoading(true);
    setShowMoreDetails(false);
    setActivityLogExpanded(false);
    setActivityFilter("all");
    fetchClient();
    fetchPayments();
    if (!isBillingOnly) {
      fetchActivities();
      fetchInteractions();
      fetchFiles();
    }
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  const refreshAll = () => {
    fetchClient();
    queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
    queryClient.invalidateQueries({ queryKey: ["admin-badges"] });
  };

  const handleSaveNotes = async () => {
    try {
      await apiRequest("PATCH", `/api/clients/${clientId}`, { notes: editNotes });
      toast({ title: isHe ? "נשמר" : "Saved", description: isHe ? "ההערות עודכנו בהצלחה" : "Notes updated successfully" });
      refreshAll();
    } catch {
      toast({ title: isHe ? "שגיאה" : "Error", description: isHe ? "שמירת ההערות נכשלה" : "Failed to save notes", variant: "destructive" });
    }
  };

  const handleSaveDetails = async () => {
    try {
      await apiRequest("PATCH", `/api/clients/${clientId}`, {
        dateOfBirth: editDob || null,
        city: editCity.trim() || null,
        gender: editGender || null,
        isDiagnosed: editIsDiagnosed === "yes" ? true : editIsDiagnosed === "no" ? false : null,
      });
      toast({ title: isHe ? "נשמר" : "Saved", description: isHe ? "הפרטים עודכנו בהצלחה" : "Details updated successfully" });
      refreshAll();
    } catch {
      toast({ title: isHe ? "שגיאה" : "Error", description: isHe ? "שמירת הפרטים נכשלה" : "Failed to save details", variant: "destructive" });
    }
  };

  const handleToggleStatus = async () => {
    if (!client) return;
    const newStatus = client.status === 'client' ? 'lead' : 'client';
    try {
      await apiRequest("PATCH", `/api/clients/${client.id}`, { status: newStatus });
      toast({
        title: isHe ? "סטטוס עודכן" : "Status Updated",
        description: newStatus === 'client'
          ? (isHe ? "הליד הומר ללקוח בהצלחה" : "Lead converted to client successfully")
          : (isHe ? "הלקוח הוחזר לסטטוס ליד" : "Client reverted to lead status"),
      });
      refreshAll();
    } catch {
      toast({ title: isHe ? "שגיאה" : "Error", description: isHe ? "עדכון סטטוס נכשל" : "Failed to update status", variant: "destructive" });
    }
  };

  const handleAddActivity = async () => {
    if (!activityDesc.trim()) return;
    const fullDescription = activityMeta.trim()
      ? `${activityDesc.trim()} [${activityMeta.trim()}]`
      : activityDesc.trim();
    try {
      await apiRequest("POST", `/api/clients/${clientId}/activities`, {
        clientId,
        type: activityType,
        description: fullDescription,
      });
      toast({ title: isHe ? "פעילות נוספה" : "Activity added", description: isHe ? "הפעילות נוספה בהצלחה" : "Activity has been added successfully" });
      setActivityDesc("");
      setActivityMeta("");
      setActivityType("note");
      fetchActivities();
    } catch {
      toast({ title: isHe ? "שגיאה" : "Error", description: isHe ? "הוספת פעילות נכשלה" : "Failed to add activity", variant: "destructive" });
    }
  };

  const handleMarkTest = async () => {
    try {
      await apiRequest("PATCH", `/api/clients/${clientId}/mark-test`, { isTest: true });
      toast({ title: isHe ? "סומן כבדיקה" : "Marked as test", description: isHe ? "הפריט הוסתר מהרשימה הרגילה." : "The item has been hidden from the normal list." });
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      onBack();
    } catch {
      toast({ title: isHe ? "שגיאה" : "Error", description: isHe ? "הסימון נכשל" : "Failed to mark as test", variant: "destructive" });
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleString(isHe ? "he-IL" : "en-US", {
      year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit",
    });
  };

  const formatDateTime = formatDate;

  const renderInteractionItem = (gi: GroupedInteraction) => {
    const config = INTERACTION_CONFIG[gi.type];
    const Icon = config.icon;

    if (gi.type === 'contact') {
      const c = gi.item as Contact;
      return (
        <div key={`contact-${c.id}`} className="flex items-start gap-2 text-sm bg-background rounded-md p-2 border">
          <Badge variant="secondary" className={`no-default-hover-elevate no-default-active-elevate shrink-0 text-xs ${config.color}`}>
            <Icon className="w-3 h-3 mr-1" />
            {isHe ? config.he : config.en}
          </Badge>
          <div className="flex-1 min-w-0 space-y-0.5">
            <div className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
              {c.name && <span className="font-medium text-foreground">{c.name}</span>}
              {c.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{c.phone}</span>}
              {c.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{c.email}</span>}
            </div>
            <p className="truncate">{c.message}</p>
          </div>
          <span className="text-xs text-muted-foreground shrink-0">{formatDate(c.createdAt)}</span>
        </div>
      );
    }

    if (gi.type === 'appointment') {
      const a = gi.item as Appointment;
      const statusColor = a.status === 'confirmed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : a.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' : a.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-800/30 dark:text-gray-400';
      const statusLabel = a.status === 'pending' ? (isHe ? 'ממתין' : 'Pending') : a.status === 'confirmed' ? (isHe ? 'מאושר' : 'Confirmed') : a.status === 'cancelled' ? (isHe ? 'בוטל' : 'Cancelled') : (isHe ? 'הושלם' : 'Completed');
      return (
        <div key={`appt-${a.id}`} className="flex items-start gap-2 text-sm bg-background rounded-md p-2 border">
          <Badge variant="secondary" className={`no-default-hover-elevate no-default-active-elevate shrink-0 text-xs ${statusColor}`}>
            <Icon className="w-3 h-3 mr-1" />
            {statusLabel}
          </Badge>
          <div className="flex-1 min-w-0 space-y-0.5">
            <div className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
              {a.clientName && <span className="font-medium text-foreground">{a.clientName}</span>}
              {a.clientPhone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{a.clientPhone}</span>}
              {a.clientEmail && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{a.clientEmail}</span>}
            </div>
            <p>{a.date} {a.time} - {a.type}</p>
          </div>
          <span className="text-xs text-muted-foreground shrink-0">{formatDate(a.createdAt)}</span>
        </div>
      );
    }

    if (gi.type === 'questionnaire') {
      const q = gi.item as QuestionnaireSubmission;
      const typeNames: Record<string, { he: string; en: string }> = {
        parent: { he: "הורה", en: "Parent" },
        teacher: { he: "מורה", en: "Teacher" },
        self_report: { he: "דיווח עצמי", en: "Self-Report" },
      };
      const tn = typeNames[q.type] || { he: q.type, en: q.type };
      return (
        <div key={`quest-${q.id}`} className="flex items-start gap-2 text-sm bg-background rounded-md p-2 border">
          <Badge variant="secondary" className={`no-default-hover-elevate no-default-active-elevate shrink-0 text-xs ${config.color}`}>
            <Icon className="w-3 h-3 mr-1" />
            {isHe ? tn.he : tn.en}
          </Badge>
          <div className="flex-1 min-w-0 space-y-0.5">
            <div className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
              {q.respondentName && <span className="font-medium text-foreground">{q.respondentName}</span>}
              {q.respondentPhone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{q.respondentPhone}</span>}
              {q.respondentEmail && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{q.respondentEmail}</span>}
            </div>
            {q.childName && <p>{isHe ? 'ילד' : 'Child'}: {q.childName}</p>}
          </div>
          <span className="text-xs text-muted-foreground shrink-0">{formatDate(q.createdAt)}</span>
        </div>
      );
    }

    if (gi.type === 'conversation') {
      const conv = gi.item as Conversation;
      return (
        <div key={`conv-${conv.id}`} className="flex items-start gap-2 text-sm bg-background rounded-md p-2 border">
          <Badge variant="secondary" className={`no-default-hover-elevate no-default-active-elevate shrink-0 text-xs ${config.color}`}>
            <Icon className="w-3 h-3 mr-1" />
            {isHe ? config.he : config.en}
          </Badge>
          <div className="flex-1 min-w-0 space-y-0.5">
            <div className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
              {conv.visitorName && <span className="font-medium text-foreground">{conv.visitorName}</span>}
              {conv.visitorPhone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{conv.visitorPhone}</span>}
              {conv.visitorEmail && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{conv.visitorEmail}</span>}
            </div>
            <p className="truncate">{conv.title}</p>
          </div>
          <span className="text-xs text-muted-foreground shrink-0">{formatDate(conv.createdAt)}</span>
        </div>
      );
    }

    if (gi.type === 'whatsapp') {
      const wm = gi.item as WhatsAppMessage;
      return (
        <div key={`wa-${wm.id}`} className="flex items-start gap-2 text-sm bg-background rounded-md p-2 border">
          <Badge variant="secondary" className={`no-default-hover-elevate no-default-active-elevate shrink-0 text-xs ${config.color}`}>
            <SiWhatsapp className="w-3 h-3 mr-1" />
            {isHe ? 'וואטסאפ' : 'WhatsApp'}
          </Badge>
          <div className="flex-1 min-w-0 space-y-0.5">
            <div className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{wm.phone}</span>
              <span>{wm.direction === 'inbound' ? (isHe ? 'נכנסת' : 'Inbound') : (isHe ? 'יוצאת' : 'Outbound')}</span>
            </div>
            <p className="truncate">{wm.content}</p>
          </div>
          <span className="text-xs text-muted-foreground shrink-0">{formatDate(wm.createdAt)}</span>
        </div>
      );
    }

    return null;
  };

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  const filteredActivities = activityFilter === "all" ? activities : activities.filter((a) => a.type === activityFilter);

  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={onBack} data-testid="button-back-to-list">
        <BackIcon className="w-4 h-4" />
        <span className="ml-1">{isHe ? "חזרה לרשימה" : "Back to list"}</span>
      </Button>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : !client ? (
        <div className="text-center py-16 text-muted-foreground" data-testid="empty-client-detail">
          <p>{isHe ? "הליד/לקוח לא נמצא" : "Lead/client not found"}</p>
        </div>
      ) : (
        <>
          <Card data-testid={`client-detail-header-${client.id}`}>
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl font-bold tracking-tight" data-testid="text-client-detail-name">{client.name}</h1>
                <Badge
                  variant="secondary"
                  className={`no-default-hover-elevate no-default-active-elevate text-sm px-3 py-1 ${client.status === 'client' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'}`}
                  data-testid="badge-client-detail-id"
                >
                  {client.status === 'client'
                    ? `${isHe ? "לקוח" : "Client"} #${client.clientNumber ?? client.id}`
                    : `${isHe ? "ליד" : "Lead"} #${client.leadNumber ?? client.id}`}
                </Badge>
              </div>
              <div className="flex items-center gap-4 flex-wrap text-sm text-muted-foreground">
                {client.email && <span className="flex items-center gap-1"><Mail className="w-4 h-4" />{client.email}</span>}
                {client.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {client.phone}
                    <a
                      href={formatWhatsAppUrl(client.phone, isHe ? `שלום ${client.name}, פונה אליך מקשב פלוס` : `Hi ${client.name}, reaching out from KeshevPlus`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#25D366] hover:underline flex items-center gap-0.5 ms-1"
                      data-testid={`link-whatsapp-client-${client.id}`}
                    >
                      <SiWhatsapp className="w-4 h-4" />
                    </a>
                  </span>
                )}
                {(client as any).childName && <span className="flex items-center gap-1"><UserCheck className="w-4 h-4" />{(client as any).childName}</span>}
                <span>{isHe ? "יצירת קשר ראשונית:" : "First contact:"} {formatDate(client.createdAt)}</span>
                {client.clientSince && <span>{isHe ? "לקוח מאז:" : "Client since:"} {formatDate(client.clientSince)}</span>}
              </div>
            </CardContent>
          </Card>

          <div className={cn(!isBillingOnly && "grid grid-cols-1 lg:grid-cols-5 gap-4")}>
          <div className={cn(!isBillingOnly && "lg:col-span-3", "space-y-4")}>

          {!isBillingOnly && (
          <Card>
            <CardContent className="pt-6 space-y-2">
              <button
                type="button"
                onClick={() => setShowMoreDetails(!showMoreDetails)}
                className="flex items-center gap-2 text-sm font-semibold hover:text-primary transition-colors"
                data-testid="button-toggle-more-details"
              >
                {showMoreDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                {isHe ? "פרטים נוספים" : "More Details"}
                {!showMoreDetails && (client.dateOfBirth || client.city || client.gender || client.isDiagnosed !== null) && (
                  <span className="text-xs text-muted-foreground font-normal">
                    ({[
                      calculateAge(client.dateOfBirth) !== null ? `${isHe ? "גיל" : "Age"} ${calculateAge(client.dateOfBirth)}` : null,
                      client.city,
                    ].filter(Boolean).join(" · ")})
                  </span>
                )}
              </button>
              {showMoreDetails && (
                <div className="border rounded-md p-3 bg-muted/20 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="input-dob">{isHe ? "תאריך לידה" : "Date of Birth"}</Label>
                      <Input id="input-dob" type="date" value={editDob} onChange={(e) => setEditDob(e.target.value)} data-testid="input-dob" />
                      {calculateAge(editDob) !== null && (
                        <p className="text-xs text-muted-foreground">{isHe ? `גיל: ${calculateAge(editDob)}` : `Age: ${calculateAge(editDob)}`}</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="input-city">{isHe ? "עיר" : "City"}</Label>
                      <Input id="input-city" value={editCity} onChange={(e) => setEditCity(e.target.value)} placeholder={isHe ? "עיר" : "City"} data-testid="input-city" />
                    </div>
                    <div className="space-y-1">
                      <Label>{isHe ? "מגדר" : "Gender"}</Label>
                      <Select value={editGender || undefined} onValueChange={setEditGender}>
                        <SelectTrigger data-testid="select-gender"><SelectValue placeholder={isHe ? "בחר/י" : "Select"} /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">{isHe ? "זכר" : "Male"}</SelectItem>
                          <SelectItem value="female">{isHe ? "נקבה" : "Female"}</SelectItem>
                          <SelectItem value="other">{isHe ? "אחר" : "Other"}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label>{isHe ? "מאובחן/ת?" : "Diagnosed?"}</Label>
                      <Select value={editIsDiagnosed || undefined} onValueChange={setEditIsDiagnosed}>
                        <SelectTrigger data-testid="select-diagnosed"><SelectValue placeholder={isHe ? "לא ידוע" : "Unknown"} /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">{isHe ? "כן" : "Yes"}</SelectItem>
                          <SelectItem value="no">{isHe ? "לא" : "No"}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button size="sm" onClick={handleSaveDetails} data-testid="button-save-details">
                    <Save className="w-4 h-4" />
                    <span className="ml-1">{isHe ? "שמור פרטים" : "Save Details"}</span>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          )}

          {!isBillingOnly && (
          <Card>
            <CardContent className="pt-6 flex items-center gap-3 flex-wrap">
              <span className="text-sm font-medium">{isHe ? "סטטוס:" : "Status:"}</span>
              <Badge
                variant="secondary"
                className={`no-default-hover-elevate no-default-active-elevate ${client.status === 'client' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'}`}
              >
                {client.status === 'client' ? (isHe ? "לקוח" : "Client") : (isHe ? "ליד" : "Lead")}
              </Badge>
              {(() => {
                const sourceLabel = SOURCE_LABELS[client.source || 'manual'];
                return (
                  <Badge variant="secondary" className="no-default-hover-elevate no-default-active-elevate">
                    {isHe ? sourceLabel?.he : sourceLabel?.en}
                  </Badge>
                );
              })()}
              <Button size="sm" variant={client.status === 'client' ? "outline" : "default"} onClick={handleToggleStatus} data-testid="button-convert-status">
                <ArrowRightLeft className="w-4 h-4" />
                <span className="ml-1">{client.status === 'client' ? (isHe ? "החזר לליד" : "Revert to Lead") : (isHe ? "המר ללקוח" : "Convert to Client")}</span>
              </Button>
              <Button size="sm" variant="outline" onClick={handleMarkTest} data-testid="button-mark-test-client">
                {isHe ? "סמן כבדיקה" : "Mark as test"}
              </Button>
            </CardContent>
          </Card>
          )}

          {!isBillingOnly && (
          <Card>
            <CardContent className="pt-6 space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h4 className="text-sm font-semibold">{isHe ? "יומן פעילות" : "Activity Log"}</h4>
                {activities.length > 0 && (
                  <Select value={activityFilter} onValueChange={setActivityFilter}>
                    <SelectTrigger className="w-[160px] h-8 text-xs" data-testid="select-activity-filter">
                      <div className="flex items-center gap-1.5">
                        <Filter className="h-3.5 w-3.5" />
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{isHe ? "כל הסוגים" : "All types"}</SelectItem>
                      {Object.entries(ACTIVITY_TYPES).map(([key, val]) => (
                        <SelectItem key={key} value={key}>{isHe ? val.he : val.en}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              {activitiesLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
                </div>
              ) : filteredActivities.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2" data-testid="empty-activities">
                  {activities.length === 0
                    ? (isHe ? "אין פעילויות עדיין" : "No activities yet")
                    : (isHe ? "אין פעילויות מהסוג שנבחר" : "No activities of this type")}
                </p>
              ) : (
                <div className={cn("rounded-xl border border-muted/40 bg-muted/10 p-2 shadow-sm", activityLogExpanded && "max-h-[400px] overflow-y-auto")}>
                  <div className="space-y-2">
                    {(activityLogExpanded ? filteredActivities : filteredActivities.slice(0, 3)).map((activity) => {
                      const typeInfo = ACTIVITY_TYPES[activity.type] || ACTIVITY_TYPES.note;
                      const TypeIcon = typeInfo.icon;
                      return (
                        <div key={activity.id} className="flex items-start gap-2 text-sm rounded-lg border p-2 bg-background" data-testid={`activity-${activity.id}`}>
                          <Badge variant="secondary" className={`shrink-0 no-default-hover-elevate no-default-active-elevate ${typeInfo.color}`} data-testid={`badge-activity-type-${activity.id}`}>
                            <TypeIcon className="w-3 h-3 mr-1" />
                            {isHe ? typeInfo.he : typeInfo.en}
                          </Badge>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm leading-snug text-foreground">{activity.description}</div>
                            <div className="mt-1 text-[11px] text-muted-foreground">{formatDateTime(activity.createdAt)}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {filteredActivities.length > 3 && (
                <button type="button" onClick={() => setActivityLogExpanded(!activityLogExpanded)} className="text-xs text-primary hover:underline" data-testid="button-toggle-activity-log">
                  {activityLogExpanded ? (isHe ? "הצג פחות" : "Show less") : (isHe ? `הצג עוד (${filteredActivities.length - 3})` : `Show more (${filteredActivities.length - 3})`)}
                </button>
              )}
            </CardContent>
          </Card>
          )}

          {interactions && (
            <Card>
              <CardContent className="pt-6 space-y-3">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  {isHe ? "היסטוריית אינטראקציות" : "Interaction History"}
                </h4>
                {(() => {
                  const grouped = groupInteractions(interactions);
                  if (grouped.length === 0) {
                    return <p className="text-sm text-muted-foreground">{isHe ? "אין אינטראקציות מתועדות" : "No recorded interactions"}</p>;
                  }
                  return <div className="space-y-1">{grouped.map(gi => renderInteractionItem(gi))}</div>;
                })()}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="pt-6 space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Receipt className="w-4 h-4" />
                {isHe ? "חשבונות ותשלומים" : "Accounting & Payments"}
              </h4>

              {paymentsLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
                </div>
              ) : payments.length === 0 ? (
                <p className="text-sm text-muted-foreground py-1" data-testid="empty-payments">
                  {isHe ? "אין רישומי תשלום עדיין" : "No payment records yet"}
                </p>
              ) : (
                <>
                  <div className="text-sm font-medium text-foreground" data-testid="text-payments-total">
                    {isHe ? "סה\"כ שולם: " : "Total paid: "}
                    <span className="font-semibold">
                      ₪{payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + Number(p.amount), 0).toLocaleString(isHe ? "he-IL" : "en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {payments.map((payment) => {
                      const statusInfo = PAYMENT_STATUS_CONFIG[payment.status] || PAYMENT_STATUS_CONFIG.paid;
                      const methodLabel = payment.method ? PAYMENT_METHOD_LABELS[payment.method]?.[isHe ? 'he' : 'en'] ?? payment.method : null;
                      return (
                        <div key={payment.id} className="flex items-start justify-between gap-2 text-sm rounded-lg border p-2 bg-background" data-testid={`payment-${payment.id}`}>
                          <div className="flex-1 min-w-0 space-y-0.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-semibold text-foreground">₪{Number(payment.amount).toLocaleString(isHe ? "he-IL" : "en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                              <Badge variant="secondary" className={`no-default-hover-elevate no-default-active-elevate text-xs ${statusInfo.color}`}>
                                {isHe ? statusInfo.he : statusInfo.en}
                              </Badge>
                              {methodLabel && <span className="text-xs text-muted-foreground">{methodLabel}</span>}
                              {payment.invoiceNumber && <span className="text-xs text-muted-foreground">#{payment.invoiceNumber}</span>}
                            </div>
                            {payment.description && <p className="text-xs text-muted-foreground">{payment.description}</p>}
                            <p className="text-[11px] text-muted-foreground">{payment.date}</p>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 shrink-0 text-destructive"
                            onClick={() => handleDeletePayment(payment.id)}
                            data-testid={`button-delete-payment-${payment.id}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              <div className="border-t pt-3 space-y-2">
                <h5 className="text-xs font-semibold text-muted-foreground">{isHe ? "הוספת רישום תשלום" : "Add a payment record"}</h5>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="input-payment-date" className="text-xs">{isHe ? "תאריך" : "Date"}</Label>
                    <Input id="input-payment-date" type="date" value={newPaymentDate} onChange={(e) => setNewPaymentDate(e.target.value)} className="h-8 text-xs" data-testid="input-payment-date" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="input-payment-amount" className="text-xs">{isHe ? "סכום (₪)" : "Amount (₪)"}</Label>
                    <Input id="input-payment-amount" type="number" min="0" step="0.01" value={newPaymentAmount} onChange={(e) => setNewPaymentAmount(e.target.value)} placeholder="0.00" className="h-8 text-xs" data-testid="input-payment-amount" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{isHe ? "אמצעי תשלום" : "Method"}</Label>
                    <Select value={newPaymentMethod} onValueChange={setNewPaymentMethod}>
                      <SelectTrigger className="h-8 text-xs" data-testid="select-payment-method"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(PAYMENT_METHOD_LABELS).map(([key, val]) => (
                          <SelectItem key={key} value={key} className="text-xs">{isHe ? val.he : val.en}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{isHe ? "סטטוס" : "Status"}</Label>
                    <Select value={newPaymentStatus} onValueChange={setNewPaymentStatus}>
                      <SelectTrigger className="h-8 text-xs" data-testid="select-payment-status"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(PAYMENT_STATUS_CONFIG).map(([key, val]) => (
                          <SelectItem key={key} value={key} className="text-xs">{isHe ? val.he : val.en}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="input-payment-description" className="text-xs">{isHe ? "תיאור (אופציונלי)" : "Description (optional)"}</Label>
                    <Input id="input-payment-description" value={newPaymentDescription} onChange={(e) => setNewPaymentDescription(e.target.value)} placeholder={isHe ? "לדוגמה: אבחון ראשוני" : "e.g. Initial diagnosis"} className="h-8 text-xs" data-testid="input-payment-description" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="input-payment-invoice" className="text-xs">{isHe ? "מספר חשבונית (אופציונלי)" : "Invoice # (optional)"}</Label>
                    <Input id="input-payment-invoice" value={newPaymentInvoiceNumber} onChange={(e) => setNewPaymentInvoiceNumber(e.target.value)} className="h-8 text-xs" data-testid="input-payment-invoice" />
                  </div>
                </div>
                <Button size="sm" onClick={handleAddPayment} disabled={addingPayment} data-testid="button-add-payment">
                  <Plus className="w-4 h-4" />
                  <span className="ml-1">{isHe ? "הוסף רישום" : "Add record"}</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {!isBillingOnly && (
          <Card>
            <CardContent className="pt-6 space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Paperclip className="w-4 h-4" />
                {isHe ? "קבצים ומסמכים" : "Files & Documents"}
              </h4>

              {filesLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
                </div>
              ) : files.length === 0 ? (
                <p className="text-sm text-muted-foreground py-1" data-testid="empty-files">
                  {isHe ? "אין קבצים מצורפים עדיין" : "No files uploaded yet"}
                </p>
              ) : (
                <div className="space-y-2">
                  {files.map((file) => (
                    <div key={file.id} className="flex items-center justify-between gap-2 text-sm rounded-lg border p-2 bg-background" data-testid={`file-${file.id}`}>
                      <div className="flex-1 min-w-0 flex items-center gap-2">
                        <FileText className="w-4 h-4 shrink-0 text-muted-foreground" />
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">{file.fileName}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {formatFileSize(file.fileSize)} · {new Date(file.createdAt).toLocaleDateString(isHe ? "he-IL" : "en-US")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() => window.open(`/api/clients/files/${file.id}/download`, "_blank")}
                          data-testid={`button-download-file-${file.id}`}
                        >
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-destructive"
                          onClick={() => handleDeleteFile(file.id)}
                          data-testid={`button-delete-file-${file.id}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t pt-3">
                <Label htmlFor="input-file-upload" className="inline-flex">
                  <Button size="sm" disabled={uploadingFile} asChild data-testid="button-upload-file">
                    <span>
                      <Upload className="w-4 h-4" />
                      <span className="ml-1">{uploadingFile ? (isHe ? "מעלה..." : "Uploading...") : (isHe ? "העלה קובץ" : "Upload file")}</span>
                    </span>
                  </Button>
                </Label>
                <input
                  id="input-file-upload"
                  type="file"
                  className="hidden"
                  accept={(CLIENT_FILE_ALLOWED_TYPES as readonly string[]).join(",")}
                  disabled={uploadingFile}
                  onChange={(e) => { handleUploadFile(e.target.files); e.target.value = ""; }}
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  {isHe ? "תמונות, PDF ומסמכי Word/Excel, עד 8MB" : "Images, PDF, and Word/Excel documents, up to 8MB"}
                </p>
              </div>
            </CardContent>
          </Card>
          )}

          {!isBillingOnly && (
          <Card>
            <CardContent className="pt-6 space-y-2">
              <Label>{isHe ? "הערות" : "Notes"}</Label>
              <Textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} placeholder={isHe ? "הערות..." : "Notes..."} data-testid="textarea-notes" />
              <Button size="sm" onClick={handleSaveNotes} data-testid="button-save-notes">
                <Save className="w-4 h-4" />
                <span className="ml-1">{isHe ? "שמור הערות" : "Save Notes"}</span>
              </Button>
            </CardContent>
          </Card>
          )}

          {!isBillingOnly && (
          <Card>
            <CardContent className="pt-6 space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h4 className="text-sm font-semibold">{isHe ? "הוסף פעילות" : "Add Activity"}</h4>
                <span className="text-xs text-muted-foreground" data-testid="text-current-time">{formatDateTime(new Date())}</span>
              </div>
              <div className="flex items-end gap-2 flex-wrap">
                <div className="space-y-1">
                  <Label>{isHe ? "סוג" : "Type"}</Label>
                  <Select value={activityType} onValueChange={setActivityType}>
                    <SelectTrigger className="w-[150px]" data-testid="select-activity-type"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(ACTIVITY_TYPES).map(([key, val]) => (
                        <SelectItem key={key} value={key} data-testid={`option-activity-${key}`}>{isHe ? val.he : val.en}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 min-w-[200px] space-y-1">
                  <Label>{isHe ? "תיאור" : "Description"}</Label>
                  <Textarea value={activityDesc} onChange={(e) => setActivityDesc(e.target.value)} placeholder={isHe ? "תיאור הפעילות" : "Activity description"} className="min-h-[60px]" data-testid="input-activity-desc" />
                </div>
              </div>
              <div className="flex items-end gap-2 flex-wrap">
                <div className="flex-1 min-w-[200px] space-y-1">
                  <Label>{isHe ? "נוסף על ידי (אופציונלי)" : "Added by (optional)"}</Label>
                  <Input value={activityMeta} onChange={(e) => setActivityMeta(e.target.value)} placeholder={isHe ? "שם המוסיף / הערות מטא" : "Name of admin / meta notes"} data-testid="input-activity-meta" />
                </div>
                <Button size="sm" onClick={handleAddActivity} data-testid="button-add-activity">
                  <Plus className="w-4 h-4" />
                  <span className="ml-1">{isHe ? "הוסף" : "Add"}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
          )}

          </div>

          {!isBillingOnly && (
          <div className="lg:col-span-2 space-y-4">
            <AppointmentPanel
              client={client}
              appointments={interactions?.appointments ?? []}
              canManage={isAdmin}
              isHe={isHe}
              onChanged={() => { fetchInteractions(); fetchActivities(); }}
            />
          </div>
          )}

          </div>
        </>
      )}
    </div>
  );
};

export default ClientDetailPage;
