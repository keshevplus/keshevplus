import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Plus, Save, ChevronDown, ChevronUp, Phone, Mail, StickyNote, PhoneCall, Calendar, DollarSign, MailOpen, MessageCircle, FileText, ClipboardList, UserCheck, ArrowRightLeft, Trash2 } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";
import { apiRequest } from "@/lib/queryClient";
import type { Client, ClientActivity, Contact, Appointment, QuestionnaireSubmission, Conversation } from "@shared/schema";

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
}

interface GroupedInteraction {
  type: 'contact' | 'appointment' | 'questionnaire' | 'conversation';
  date: Date;
  item: Contact | Appointment | QuestionnaireSubmission | Conversation;
}

const ACTIVITY_TYPES: Record<string, { he: string; en: string; color: string; icon: typeof StickyNote }> = {
  note: { he: "הערה", en: "Note", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300", icon: StickyNote },
  call: { he: "שיחה", en: "Call", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300", icon: PhoneCall },
  meeting: { he: "פגישה", en: "Meeting", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300", icon: Calendar },
  sale: { he: "מכירה", en: "Sale", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300", icon: DollarSign },
  email: { he: 'דוא"ל', en: "Email", color: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300", icon: MailOpen },
};

const SOURCE_LABELS: Record<string, { he: string; en: string }> = {
  contact_form: { he: "טופס יצירת קשר", en: "Contact Form" },
  appointment: { he: "קביעת תור", en: "Appointment" },
  questionnaire: { he: "שאלון", en: "Questionnaire" },
  chat: { he: "צ'אט", en: "Chat" },
  manual: { he: "ידני", en: "Manual" },
};

const INTERACTION_CONFIG = {
  contact: {
    he: "פנייה",
    en: "Contact",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    icon: Mail,
  },
  appointment: {
    he: "תור",
    en: "Appointment",
    color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    icon: Calendar,
  },
  questionnaire: {
    he: "שאלון",
    en: "Questionnaire",
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    icon: ClipboardList,
  },
  conversation: {
    he: "צ'אט",
    en: "Chat",
    color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    icon: MessageCircle,
  },
};

function groupInteractions(inter: ClientInteractions): GroupedInteraction[] {
  const items: GroupedInteraction[] = [];
  inter.contacts.forEach(c => items.push({ type: 'contact', date: new Date(c.createdAt), item: c }));
  inter.appointments.forEach(a => items.push({ type: 'appointment', date: new Date(a.createdAt), item: a }));
  inter.questionnaires.forEach(q => items.push({ type: 'questionnaire', date: new Date(q.createdAt), item: q }));
  inter.conversations.forEach(cv => items.push({ type: 'conversation', date: new Date(cv.createdAt), item: cv }));
  items.sort((a, b) => b.date.getTime() - a.date.getTime());
  return items;
}

const ClientsManager = () => {
  const { language } = useLanguage();
  const isHe = language === "he";
  const { toast } = useToast();

  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedClientId, setExpandedClientId] = useState<number | null>(null);
  const [activities, setActivities] = useState<ClientActivity[]>([]);
  const [interactions, setInteractions] = useState<ClientInteractions | null>(null);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [selectMode, setSelectMode] = useState(false);

  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newNotes, setNewNotes] = useState("");

  const [editNotes, setEditNotes] = useState("");
  const [activityType, setActivityType] = useState("note");
  const [activityDesc, setActivityDesc] = useState("");
  const [activityMeta, setActivityMeta] = useState("");

  const fetchClients = async () => {
    try {
      const res = await fetch("/api/clients", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch clients");
      const data = await res.json();
      setClients(data);
    } catch {
      toast({ title: isHe ? "שגיאה" : "Error", description: isHe ? "טעינת נתונים נכשלה" : "Failed to load data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async (clientId: number) => {
    setActivitiesLoading(true);
    try {
      const res = await fetch(`/api/clients/${clientId}/activities`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch activities");
      const data = await res.json();
      setActivities(data);
    } catch {
      setActivities([]);
    } finally {
      setActivitiesLoading(false);
    }
  };

  const fetchInteractions = async (clientId: number) => {
    try {
      const res = await fetch(`/api/clients/${clientId}/interactions`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch interactions");
      const data = await res.json();
      setInteractions(data);
    } catch {
      setInteractions(null);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleExpand = (client: Client) => {
    if (expandedClientId === client.id) {
      setExpandedClientId(null);
      setActivities([]);
      setInteractions(null);
      return;
    }
    setExpandedClientId(client.id);
    setEditNotes(client.notes || "");
    fetchActivities(client.id);
    fetchInteractions(client.id);
  };

  const handleAddClient = async () => {
    if (!newName.trim()) {
      toast({ title: isHe ? "שגיאה" : "Error", description: isHe ? "שם נדרש" : "Name is required", variant: "destructive" });
      return;
    }
    try {
      await apiRequest("POST", "/api/clients", {
        name: newName.trim(),
        email: newEmail.trim() || null,
        phone: newPhone.trim() || null,
        notes: newNotes.trim() || null,
      });
      toast({ title: isHe ? "הליד נוסף" : "Lead added", description: isHe ? "הליד נוסף בהצלחה" : "Lead has been added successfully" });
      setNewName("");
      setNewEmail("");
      setNewPhone("");
      setNewNotes("");
      setShowAddForm(false);
      fetchClients();
    } catch {
      toast({ title: isHe ? "שגיאה" : "Error", description: isHe ? "הוספת ליד נכשלה" : "Failed to add lead", variant: "destructive" });
    }
  };

  const handleSaveNotes = async (clientId: number) => {
    try {
      await apiRequest("PATCH", `/api/clients/${clientId}`, { notes: editNotes });
      toast({ title: isHe ? "נשמר" : "Saved", description: isHe ? "ההערות עודכנו בהצלחה" : "Notes updated successfully" });
      fetchClients();
    } catch {
      toast({ title: isHe ? "שגיאה" : "Error", description: isHe ? "שמירת ההערות נכשלה" : "Failed to save notes", variant: "destructive" });
    }
  };

  const handleToggleStatus = async (client: Client) => {
    const newStatus = client.status === 'client' ? 'lead' : 'client';
    try {
      await apiRequest("PATCH", `/api/clients/${client.id}`, { status: newStatus });
      toast({
        title: isHe ? "סטטוס עודכן" : "Status Updated",
        description: newStatus === 'client'
          ? (isHe ? "הליד הומר ללקוח בהצלחה" : "Lead converted to client successfully")
          : (isHe ? "הלקוח הוחזר לסטטוס ליד" : "Client reverted to lead status"),
      });
      fetchClients();
    } catch {
      toast({ title: isHe ? "שגיאה" : "Error", description: isHe ? "עדכון סטטוס נכשל" : "Failed to update status", variant: "destructive" });
    }
  };

  const handleAddActivity = async (clientId: number) => {
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
      fetchActivities(clientId);
    } catch {
      toast({ title: isHe ? "שגיאה" : "Error", description: isHe ? "הוספת פעילות נכשלה" : "Failed to add activity", variant: "destructive" });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    const msg = isHe
      ? `למחוק ${selectedIds.size} לידים/לקוחות?`
      : `Delete ${selectedIds.size} leads/clients?`;
    if (!window.confirm(msg)) return;
    try {
      await apiRequest("POST", "/api/clients/bulk-delete", { ids: Array.from(selectedIds) });
      toast({ title: isHe ? "נמחקו" : "Deleted", description: isHe ? `${selectedIds.size} רשומות נמחקו` : `${selectedIds.size} records deleted` });
      setSelectedIds(new Set());
      setSelectMode(false);
      setExpandedClientId(null);
      fetchClients();
    } catch {
      toast({ title: isHe ? "שגיאה" : "Error", description: isHe ? "מחיקה נכשלה" : "Failed to delete", variant: "destructive" });
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === clients.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(clients.map(c => c.id)));
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleString(isHe ? "he-IL" : "en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDateTime = (date: string | Date) => {
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

  const getStatusBadges = (client: Client, inter: ClientInteractions | null) => {
    const badges: { label: string; variant: string; icon: typeof Mail }[] = [];

    if (inter && inter.contacts.length > 0) {
      badges.push({
        label: isHe ? "פנייה" : "Contacted",
        variant: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
        icon: Mail,
      });
    }

    if (inter && inter.appointments.length > 0) {
      const active = inter.appointments.find(a => a.status === 'pending' || a.status === 'confirmed');
      if (active) {
        badges.push({
          label: isHe ? "תור פעיל" : "Appointment",
          variant: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
          icon: Calendar,
        });
      } else {
        badges.push({
          label: isHe ? "תור קודם" : "Past Appt",
          variant: "bg-gray-100 text-gray-600 dark:bg-gray-800/30 dark:text-gray-400",
          icon: Calendar,
        });
      }
    }

    if (inter && inter.questionnaires.length > 0) {
      badges.push({
        label: isHe ? "שאלון" : "Questionnaire",
        variant: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
        icon: ClipboardList,
      });
    }

    if (inter && inter.conversations.length > 0) {
      badges.push({
        label: isHe ? "צ'אט" : "Chat",
        variant: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
        icon: MessageCircle,
      });
    }

    return badges;
  };

  const [clientInteractionsMap, setClientInteractionsMap] = useState<Record<number, ClientInteractions>>({});

  useEffect(() => {
    if (clients.length > 0) {
      clients.forEach(async (client) => {
        try {
          const res = await fetch(`/api/clients/${client.id}/interactions`, { credentials: "include" });
          if (res.ok) {
            const data = await res.json();
            setClientInteractionsMap(prev => ({ ...prev, [client.id]: data }));
          }
        } catch {}
      });
    }
  }, [clients]);

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
          <span className="flex-1 truncate">{c.message}</span>
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
          <span className="flex-1">{a.date} {a.time} - {a.type}</span>
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
          <span className="flex-1">{q.childName ? `${isHe ? 'ילד' : 'Child'}: ${q.childName}` : ''}</span>
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
          <span className="flex-1">{conv.title}</span>
          <span className="text-xs text-muted-foreground shrink-0">{formatDate(conv.createdAt)}</span>
        </div>
      );
    }

    return null;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <CardTitle>{isHe ? "לידים ולקוחות" : "Leads & Clients"}</CardTitle>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {clients.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectMode(!selectMode);
                  if (selectMode) setSelectedIds(new Set());
                }}
                data-testid="button-toggle-select-clients"
              >
                {selectMode ? (isHe ? 'ביטול' : 'Cancel') : (isHe ? 'בחירה מרובה' : 'Multi-Select')}
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => setShowAddForm(!showAddForm)}
              data-testid="button-toggle-add-client"
            >
              {showAddForm ? <ChevronUp className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span className="ml-1">{isHe ? (showAddForm ? "סגור" : "ליד חדש") : (showAddForm ? "Close" : "New Lead")}</span>
            </Button>
          </div>
        </div>
        <CardDescription>{isHe ? "מבקרים שהשאירו פרטים נרשמים כלידים. המרה ללקוח מתבצעת ידנית." : "Visitors who leave details are registered as leads. Conversion to client is done manually."}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {showAddForm && (
          <div className="border rounded-lg p-4 space-y-3" data-testid="add-client-form">
            <h3 className="font-semibold text-sm">{isHe ? "הוספת ליד חדש" : "Add New Lead"}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="client-name">{isHe ? "שם *" : "Name *"}</Label>
                <Input
                  id="client-name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={isHe ? "שם" : "Name"}
                  data-testid="input-client-name"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="client-email">{isHe ? "אימייל" : "Email"}</Label>
                <Input
                  id="client-email"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder={isHe ? "אימייל" : "Email"}
                  data-testid="input-client-email"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="client-phone">{isHe ? "טלפון" : "Phone"}</Label>
                <Input
                  id="client-phone"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder={isHe ? "טלפון" : "Phone"}
                  data-testid="input-client-phone"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="client-notes">{isHe ? "הערות" : "Notes"}</Label>
              <Textarea
                id="client-notes"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder={isHe ? "הערות" : "Notes"}
                data-testid="input-client-notes"
              />
            </div>
            <Button onClick={handleAddClient} data-testid="button-add-client">
              <Plus className="w-4 h-4" />
              <span className="ml-1">{isHe ? "הוסף ליד" : "Add Lead"}</span>
            </Button>
          </div>
        )}

        {selectMode && clients.length > 0 && (
          <div className="flex items-center gap-3 p-2 border rounded-md bg-muted/30 flex-wrap">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedIds.size === clients.length && clients.length > 0}
                onCheckedChange={toggleSelectAll}
                data-testid="checkbox-select-all-clients"
              />
              <span className="text-sm">
                {isHe ? 'בחר הכל' : 'Select All'}
              </span>
            </div>
            <span className="text-sm text-muted-foreground">
              {selectedIds.size} {isHe ? 'נבחרו' : 'selected'}
            </span>
            {selectedIds.size > 0 && (
              <Button
                size="sm"
                variant="outline"
                className="text-destructive border-destructive/30"
                onClick={handleBulkDelete}
                data-testid="button-bulk-delete-clients"
              >
                <Trash2 className="h-4 w-4 me-1" />
                {isHe ? `מחק (${selectedIds.size})` : `Delete (${selectedIds.size})`}
              </Button>
            )}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : clients.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground" data-testid="empty-clients">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>{isHe ? "אין לידים או לקוחות להצגה" : "No leads or clients to display"}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {clients.map((client) => {
              const isExpanded = expandedClientId === client.id;
              const clientInter = clientInteractionsMap[client.id] || null;
              const statusBadges = getStatusBadges(client, clientInter);
              const sourceLabel = SOURCE_LABELS[client.source || 'manual'];

              return (
                <div
                  key={client.id}
                  className={`border rounded-lg ${selectedIds.has(client.id) ? 'ring-2 ring-primary/40' : ''}`}
                  data-testid={`client-${client.id}`}
                >
                  <div className="flex items-center gap-2">
                    {selectMode && (
                      <div className="ps-3">
                        <Checkbox
                          checked={selectedIds.has(client.id)}
                          onCheckedChange={() => toggleSelect(client.id)}
                          data-testid={`checkbox-client-${client.id}`}
                        />
                      </div>
                    )}
                    <button
                      onClick={() => handleExpand(client)}
                      className="w-full text-left p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors flex-1"
                      data-testid={`button-expand-client-${client.id}`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap text-sm mb-1">
                          <span className="font-medium">{client.name}</span>
                          {client.email && (
                            <span className="text-muted-foreground flex items-center gap-1">
                              <Mail className="w-3.5 h-3.5" />
                              {client.email}
                            </span>
                          )}
                          {client.phone && (
                            <span className="text-muted-foreground flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5" />
                              {client.phone}
                              <a
                                href={formatWhatsAppUrl(client.phone, isHe ? `שלום ${client.name}, פונה אליך מקשב פלוס` : `Hi ${client.name}, reaching out from KeshevPlus`)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#25D366] hover:underline flex items-center gap-0.5 ms-1"
                                onClick={(e) => e.stopPropagation()}
                                data-testid={`link-whatsapp-client-${client.id}`}
                              >
                                <SiWhatsapp className="w-3.5 h-3.5" />
                              </a>
                            </span>
                          )}
                          {(client as any).childName && (
                            <span className="text-muted-foreground flex items-center gap-1">
                              <UserCheck className="w-3.5 h-3.5" />
                              {(client as any).childName}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            variant="secondary"
                            className={`no-default-hover-elevate no-default-active-elevate text-xs ${client.status === 'client' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'}`}
                            data-testid={`badge-status-type-${client.id}`}
                          >
                            {client.status === 'client' ? (isHe ? "לקוח" : "Client") : (isHe ? "ליד" : "Lead")}
                          </Badge>
                          <Badge
                            variant="secondary"
                            className="no-default-hover-elevate no-default-active-elevate text-xs"
                            data-testid={`badge-source-${client.id}`}
                          >
                            {isHe ? sourceLabel?.he : sourceLabel?.en}
                          </Badge>
                          {statusBadges.map((badge, i) => {
                            const Icon = badge.icon;
                            return (
                              <Badge
                                key={i}
                                variant="secondary"
                                className={`no-default-hover-elevate no-default-active-elevate text-xs ${badge.variant}`}
                                data-testid={`badge-status-${client.id}-${i}`}
                              >
                                <Icon className="w-3 h-3 mr-1" />
                                {badge.label}
                              </Badge>
                            );
                          })}
                          <span className="text-xs text-muted-foreground">
                            {formatDate(client.createdAt)}
                          </span>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />
                      )}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="border-t p-4 space-y-4 bg-muted/20">
                      {interactions && (
                        <div className="space-y-3">
                          <h4 className="text-sm font-semibold flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            {isHe ? "היסטוריית אינטראקציות" : "Interaction History"}
                          </h4>

                          {(() => {
                            const grouped = groupInteractions(interactions);
                            if (grouped.length === 0) {
                              return (
                                <p className="text-sm text-muted-foreground">{isHe ? "אין אינטראקציות מתועדות" : "No recorded interactions"}</p>
                              );
                            }
                            return (
                              <div className="space-y-1">
                                {grouped.map(gi => renderInteractionItem(gi))}
                              </div>
                            );
                          })()}
                        </div>
                      )}

                      <div className="flex items-center gap-3 flex-wrap border rounded-md p-3 bg-background">
                        <span className="text-sm font-medium">
                          {isHe ? "סטטוס:" : "Status:"}
                        </span>
                        <Badge
                          variant="secondary"
                          className={`no-default-hover-elevate no-default-active-elevate ${client.status === 'client' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'}`}
                        >
                          {client.status === 'client' ? (isHe ? "לקוח" : "Client") : (isHe ? "ליד" : "Lead")}
                        </Badge>
                        <Button
                          size="sm"
                          variant={client.status === 'client' ? "outline" : "default"}
                          onClick={(e) => { e.stopPropagation(); handleToggleStatus(client); }}
                          data-testid={`button-convert-${client.id}`}
                        >
                          <ArrowRightLeft className="w-4 h-4" />
                          <span className="ml-1">
                            {client.status === 'client'
                              ? (isHe ? "החזר לליד" : "Revert to Lead")
                              : (isHe ? "המר ללקוח" : "Convert to Client")}
                          </span>
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <Label>{isHe ? "הערות" : "Notes"}</Label>
                        <Textarea
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          placeholder={isHe ? "הערות..." : "Notes..."}
                          data-testid={`textarea-notes-${client.id}`}
                        />
                        <Button
                          size="sm"
                          onClick={() => handleSaveNotes(client.id)}
                          data-testid={`button-save-notes-${client.id}`}
                        >
                          <Save className="w-4 h-4" />
                          <span className="ml-1">{isHe ? "שמור הערות" : "Save Notes"}</span>
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <h4 className="text-sm font-semibold">{isHe ? "הוסף פעילות" : "Add Activity"}</h4>
                          <span className="text-xs text-muted-foreground" data-testid={`text-current-time-${client.id}`}>
                            {formatDateTime(new Date())}
                          </span>
                        </div>
                        <div className="flex items-end gap-2 flex-wrap">
                          <div className="space-y-1">
                            <Label>{isHe ? "סוג" : "Type"}</Label>
                            <Select value={activityType} onValueChange={setActivityType}>
                              <SelectTrigger className="w-[150px]" data-testid={`select-activity-type-${client.id}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(ACTIVITY_TYPES).map(([key, val]) => (
                                  <SelectItem key={key} value={key} data-testid={`option-activity-${key}`}>
                                    {isHe ? val.he : val.en}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex-1 min-w-[200px] space-y-1">
                            <Label>{isHe ? "תיאור" : "Description"}</Label>
                            <Textarea
                              value={activityDesc}
                              onChange={(e) => setActivityDesc(e.target.value)}
                              placeholder={isHe ? "תיאור הפעילות" : "Activity description"}
                              className="min-h-[60px]"
                              data-testid={`input-activity-desc-${client.id}`}
                            />
                          </div>
                        </div>
                        <div className="flex items-end gap-2 flex-wrap">
                          <div className="flex-1 min-w-[200px] space-y-1">
                            <Label>{isHe ? "נוסף על ידי (אופציונלי)" : "Added by (optional)"}</Label>
                            <Input
                              value={activityMeta}
                              onChange={(e) => setActivityMeta(e.target.value)}
                              placeholder={isHe ? "שם המוסיף / הערות מטא" : "Name of admin / meta notes"}
                              data-testid={`input-activity-meta-${client.id}`}
                            />
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleAddActivity(client.id)}
                            data-testid={`button-add-activity-${client.id}`}
                          >
                            <Plus className="w-4 h-4" />
                            <span className="ml-1">{isHe ? "הוסף" : "Add"}</span>
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">{isHe ? "יומן פעילות" : "Activity Log"}</h4>
                        {activitiesLoading ? (
                          <div className="flex items-center justify-center py-4">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
                          </div>
                        ) : activities.length === 0 ? (
                          <p className="text-sm text-muted-foreground py-2" data-testid={`empty-activities-${client.id}`}>
                            {isHe ? "אין פעילויות עדיין" : "No activities yet"}
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {activities.map((activity) => {
                              const typeInfo = ACTIVITY_TYPES[activity.type] || ACTIVITY_TYPES.note;
                              const TypeIcon = typeInfo.icon;
                              return (
                                <div
                                  key={activity.id}
                                  className="flex items-start gap-2 text-sm bg-background rounded-md p-2 border"
                                  data-testid={`activity-${activity.id}`}
                                >
                                  <Badge
                                    variant="secondary"
                                    className={`shrink-0 no-default-hover-elevate no-default-active-elevate ${typeInfo.color}`}
                                    data-testid={`badge-activity-type-${activity.id}`}
                                  >
                                    <TypeIcon className="w-3 h-3 mr-1" />
                                    {isHe ? typeInfo.he : typeInfo.en}
                                  </Badge>
                                  <span className="flex-1">{activity.description}</span>
                                  <span className="text-xs text-muted-foreground shrink-0">
                                    {formatDateTime(activity.createdAt)}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClientsManager;
