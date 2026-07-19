import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Plus, ChevronUp, ChevronRight, ChevronLeft, Phone, Mail, Calendar, MessageCircle, ClipboardList, UserCheck, Trash2, Filter, ArrowUpDown, Search, Columns2, Rows3 } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import type { Client, Contact, Appointment, QuestionnaireSubmission, Conversation } from "@shared/schema";

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

const SOURCE_LABELS: Record<string, { he: string; en: string }> = {
  contact_form: { he: "טופס יצירת קשר", en: "Contact Form" },
  appointment: { he: "קביעת תור", en: "Appointment" },
  questionnaire: { he: "שאלון", en: "Questionnaire" },
  chat: { he: "צ'אט", en: "Chat" },
  manual: { he: "ידני", en: "Manual" },
};

const LEAD_BG = ['bg-amber-50 dark:bg-amber-950/10', 'bg-yellow-50/70 dark:bg-yellow-950/10'];
const CLIENT_BG = ['bg-emerald-50 dark:bg-emerald-950/10', 'bg-teal-50/60 dark:bg-teal-950/10'];

function getRowBg(client: Client, typeIndex: number) {
  const palette = client.status === 'client' ? CLIENT_BG : LEAD_BG;
  return palette[typeIndex % 2];
}

interface ClientsManagerProps {
  onOpenClient: (clientId: number) => void;
}

type ClientSortBy = 'date-desc' | 'date-asc' | 'name-asc' | 'clientsince-desc' | 'clientsince-asc';
type ClientTypeFilter = 'all' | 'contact' | 'appointment' | 'questionnaire' | 'conversation';
type PersonFilter = 'both' | 'leads' | 'clients';
type PersonLayout = 'columns' | 'list';
type GroupOrder = 'leads-first' | 'clients-first';

const ClientsManager = ({ onOpenClient }: ClientsManagerProps) => {
  const { language, isRTL } = useLanguage();
  const isHe = language === "he";
  const { toast } = useToast();

  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [selectMode, setSelectMode] = useState(false);
  const [clientSortBy, setClientSortBy] = useState<ClientSortBy>('date-desc');
  const [clientTypeFilter, setClientTypeFilter] = useState<ClientTypeFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [personFilter, setPersonFilter] = useState<PersonFilter>('both');
  const [personLayout, setPersonLayout] = useState<PersonLayout>('columns');
  const [groupOrder, setGroupOrder] = useState<GroupOrder>('leads-first');

  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newNotes, setNewNotes] = useState("");

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

  useEffect(() => {
    fetchClients();
  }, []);

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
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      queryClient.invalidateQueries({ queryKey: ["admin-badges"] });
    } catch {
      toast({ title: isHe ? "שגיאה" : "Error", description: isHe ? "הוספת ליד נכשלה" : "Failed to add lead", variant: "destructive" });
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
      fetchClients();
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
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
      badges.push({
        label: isHe ? "תור" : "Appointment",
        variant: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
        icon: Calendar,
      });
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
    if (clients.length === 0) return;
    (async () => {
      try {
        const res = await apiRequest("POST", "/api/clients/interactions/bulk", { ids: clients.map(c => c.id) });
        const data = await res.json();
        setClientInteractionsMap(data);
      } catch {}
    })();
  }, [clients]);

  const visibleClients = useMemo(() => {
    let result = clients;
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      const qDigits = q.replace(/\D/g, '');
      result = result.filter((client) => {
        if (client.name?.toLowerCase().includes(q)) return true;
        if (client.email?.toLowerCase().includes(q)) return true;
        if (qDigits && client.phone?.replace(/\D/g, '').includes(qDigits)) return true;
        if (client.leadNumber != null && String(client.leadNumber).includes(q)) return true;
        if (client.clientNumber != null && String(client.clientNumber).includes(q)) return true;
        return false;
      });
    }
    if (clientTypeFilter !== 'all') {
      result = result.filter((client) => {
        const inter = clientInteractionsMap[client.id];
        if (!inter) return false;
        if (clientTypeFilter === 'contact') return inter.contacts.length > 0;
        if (clientTypeFilter === 'appointment') return inter.appointments.length > 0;
        if (clientTypeFilter === 'questionnaire') return inter.questionnaires.length > 0;
        if (clientTypeFilter === 'conversation') return inter.conversations.length > 0;
        return true;
      });
    }
    const sorted = [...result];
    const byNullSafeTime = (a: Client, b: Client, dir: 1 | -1) => {
      const at = a.clientSince ? new Date(a.clientSince).getTime() : null;
      const bt = b.clientSince ? new Date(b.clientSince).getTime() : null;
      if (at === null && bt === null) return 0;
      if (at === null) return 1;
      if (bt === null) return -1;
      return (bt - at) * (dir === 1 ? -1 : 1);
    };
    if (clientSortBy === 'date-asc') {
      sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (clientSortBy === 'name-asc') {
      sorted.sort((a, b) => a.name.localeCompare(b.name, isHe ? 'he' : 'en'));
    } else if (clientSortBy === 'clientsince-desc') {
      sorted.sort((a, b) => byNullSafeTime(a, b, 1));
    } else if (clientSortBy === 'clientsince-asc') {
      sorted.sort((a, b) => byNullSafeTime(a, b, -1));
    } else {
      sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return sorted;
  }, [clients, clientInteractionsMap, clientTypeFilter, clientSortBy, searchQuery, isHe]);

  const filteredByPerson = useMemo(() => {
    if (personFilter === 'leads') return visibleClients.filter(c => c.status !== 'client');
    if (personFilter === 'clients') return visibleClients.filter(c => c.status === 'client');
    return visibleClients;
  }, [visibleClients, personFilter]);

  const leadsList = useMemo(() => visibleClients.filter(c => c.status !== 'client'), [visibleClients]);
  const clientsList = useMemo(() => visibleClients.filter(c => c.status === 'client'), [visibleClients]);

  const sortedForList = useMemo(() => {
    if (!(personFilter === 'both' && personLayout === 'list')) return filteredByPerson;
    const groupRank = (c: Client) => {
      const isClient = c.status === 'client';
      if (groupOrder === 'leads-first') return isClient ? 1 : 0;
      return isClient ? 0 : 1;
    };
    return [...filteredByPerson].sort((a, b) => groupRank(a) - groupRank(b));
  }, [filteredByPerson, personFilter, personLayout, groupOrder]);

  const typeIndexMap = useMemo(() => {
    const map = new Map<number, number>();
    let leadIdx = 0, clientIdx = 0;
    for (const c of sortedForList) {
      if (c.status === 'client') { map.set(c.id, clientIdx); clientIdx++; }
      else { map.set(c.id, leadIdx); leadIdx++; }
    }
    return map;
  }, [sortedForList]);

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredByPerson.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredByPerson.map(c => c.id)));
    }
  };

  const GoIcon = isRTL ? ChevronLeft : ChevronRight;

  const renderClientRow = (client: Client, typeIndex: number) => {
    const clientInter = clientInteractionsMap[client.id] || null;
    const statusBadges = getStatusBadges(client, clientInter);
    const sourceLabel = SOURCE_LABELS[client.source || 'manual'];
    const showSourceLabel = client.source !== 'appointment' || !(clientInter?.appointments?.length > 0);

    return (
      <div
        key={client.id}
        className={cn("border rounded-lg", getRowBg(client, typeIndex), selectedIds.has(client.id) && "ring-2 ring-primary/40")}
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
            onClick={() => onOpenClient(client.id)}
            className="w-full text-left p-4 flex items-center gap-3 hover-elevate transition-colors flex-1 rounded-lg"
            data-testid={`button-open-client-${client.id}`}
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
                  {client.status === 'client'
                    ? `${isHe ? "לקוח" : "Client"} #${client.clientNumber ?? client.id}`
                    : `${isHe ? "ליד" : "Lead"} #${client.leadNumber ?? client.id}`}
                </Badge>
                {showSourceLabel && (
                  <Badge
                    variant="secondary"
                    className="no-default-hover-elevate no-default-active-elevate text-xs"
                    data-testid={`badge-source-${client.id}`}
                  >
                    {isHe ? sourceLabel?.he : sourceLabel?.en}
                  </Badge>
                )}
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
            <GoIcon className="w-5 h-5 text-muted-foreground shrink-0" />
          </button>
        </div>
      </div>
    );
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
              <>
                <Select value={clientTypeFilter} onValueChange={(value) => setClientTypeFilter(value as ClientTypeFilter)}>
                  <SelectTrigger className="w-[150px] h-8 text-xs" data-testid="select-client-type-filter">
                    <div className="flex items-center gap-1.5">
                      <Filter className="h-3.5 w-3.5" />
                      <SelectValue placeholder={isHe ? "סוג" : "Type"} />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{isHe ? "כל הסוגים" : "All types"}</SelectItem>
                    <SelectItem value="contact">{isHe ? "טופס יצירת קשר" : "Contact form"}</SelectItem>
                    <SelectItem value="appointment">{isHe ? "תור" : "Appointment"}</SelectItem>
                    <SelectItem value="questionnaire">{isHe ? "שאלון" : "Questionnaire"}</SelectItem>
                    <SelectItem value="conversation">{isHe ? "צ'אט" : "Chat"}</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={clientSortBy} onValueChange={(value) => setClientSortBy(value as ClientSortBy)}>
                  <SelectTrigger className="w-[190px] h-8 text-xs" data-testid="select-client-sort">
                    <div className="flex items-center gap-1.5">
                      <ArrowUpDown className="h-3.5 w-3.5" />
                      <SelectValue placeholder={isHe ? "מיון" : "Sort"} />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date-desc">{isHe ? "פנייה ראשונית (חדש תחילה)" : "First contact (newest)"}</SelectItem>
                    <SelectItem value="date-asc">{isHe ? "פנייה ראשונית (ישן תחילה)" : "First contact (oldest)"}</SelectItem>
                    <SelectItem value="name-asc">{isHe ? "שם (א-ת)" : "Name (A-Z)"}</SelectItem>
                    <SelectItem value="clientsince-desc">{isHe ? "הפיכה ללקוח (חדש תחילה)" : "Became client (newest)"}</SelectItem>
                    <SelectItem value="clientsince-asc">{isHe ? "הפיכה ללקוח (ישן תחילה)" : "Became client (oldest)"}</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}
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

        {clients.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap mt-2">
            <Tabs value={personFilter} onValueChange={(v) => setPersonFilter(v as PersonFilter)}>
              <TabsList data-testid="tabs-person-filter">
                <TabsTrigger value="both" data-testid="tab-person-both">{isHe ? "הכל" : "All"}</TabsTrigger>
                <TabsTrigger value="leads" data-testid="tab-person-leads">{isHe ? "לידים בלבד" : "Leads only"}</TabsTrigger>
                <TabsTrigger value="clients" data-testid="tab-person-clients">{isHe ? "לקוחות בלבד" : "Clients only"}</TabsTrigger>
              </TabsList>
            </Tabs>
            {personFilter === 'both' && (
              <>
                <Select value={personLayout} onValueChange={(v) => setPersonLayout(v as PersonLayout)}>
                  <SelectTrigger className="w-[140px] h-8 text-xs" data-testid="select-person-layout">
                    <div className="flex items-center gap-1.5">
                      {personLayout === 'columns' ? <Columns2 className="h-3.5 w-3.5" /> : <Rows3 className="h-3.5 w-3.5" />}
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="columns">{isHe ? "שתי עמודות" : "Two columns"}</SelectItem>
                    <SelectItem value="list">{isHe ? "רשימה אחת" : "Single list"}</SelectItem>
                  </SelectContent>
                </Select>
                {personLayout === 'list' && (
                  <Select value={groupOrder} onValueChange={(v) => setGroupOrder(v as GroupOrder)}>
                    <SelectTrigger className="w-[150px] h-8 text-xs" data-testid="select-group-order">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="leads-first">{isHe ? "לידים תחילה" : "Leads first"}</SelectItem>
                      <SelectItem value="clients-first">{isHe ? "לקוחות תחילה" : "Clients first"}</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </>
            )}
          </div>
        )}

        {clients.length > 0 && (
          <div className="relative mt-2">
            <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isHe ? "חיפוש לפי שם, אימייל, טלפון, מספר ליד או מספר לקוח" : "Search by name, email, phone, lead # or client #"}
              className="ps-8 h-9"
              data-testid="input-search-clients"
            />
          </div>
        )}
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
                checked={selectedIds.size === filteredByPerson.length && filteredByPerson.length > 0}
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
        ) : visibleClients.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground" data-testid="empty-clients-filtered">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>{isHe ? "אין תוצאות התואמות לסינון" : "No results match the filter"}</p>
          </div>
        ) : filteredByPerson.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground" data-testid="empty-clients-person-filtered">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>{personFilter === 'leads'
              ? (isHe ? "אין לידים התואמים" : "No leads match")
              : (isHe ? "אין לקוחות התואמים" : "No clients match")}</p>
          </div>
        ) : personFilter === 'both' && personLayout === 'columns' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2 text-amber-800 dark:text-amber-300">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
                {isHe ? `לידים (${leadsList.length})` : `Leads (${leadsList.length})`}
              </h3>
              {leadsList.length === 0 ? (
                <p className="text-sm text-muted-foreground">{isHe ? "אין לידים" : "No leads"}</p>
              ) : (
                <div className="space-y-3">{leadsList.map((c, i) => renderClientRow(c, i))}</div>
              )}
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
                {isHe ? `לקוחות (${clientsList.length})` : `Clients (${clientsList.length})`}
              </h3>
              {clientsList.length === 0 ? (
                <p className="text-sm text-muted-foreground">{isHe ? "אין לקוחות" : "No clients"}</p>
              ) : (
                <div className="space-y-3">{clientsList.map((c, i) => renderClientRow(c, i))}</div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedForList.map((c) => renderClientRow(c, typeIndexMap.get(c.id) ?? 0))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClientsManager;
