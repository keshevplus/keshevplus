import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Plus, Save, ChevronDown, ChevronUp, Phone, Mail, StickyNote, PhoneCall, Calendar, DollarSign, MailOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";
import { apiRequest } from "@/lib/queryClient";
import type { Client, ClientActivity } from "@shared/schema";

const ACTIVITY_TYPES: Record<string, { he: string; en: string; color: string; icon: typeof StickyNote }> = {
  note: { he: "הערה", en: "Note", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300", icon: StickyNote },
  call: { he: "שיחה", en: "Call", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300", icon: PhoneCall },
  meeting: { he: "פגישה", en: "Meeting", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300", icon: Calendar },
  sale: { he: "מכירה", en: "Sale", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300", icon: DollarSign },
  email: { he: 'דוא"ל', en: "Email", color: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300", icon: MailOpen },
};

const ClientsManager = () => {
  const { language } = useLanguage();
  const isHe = language === "he";
  const { toast } = useToast();

  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedClientId, setExpandedClientId] = useState<number | null>(null);
  const [activities, setActivities] = useState<ClientActivity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newNotes, setNewNotes] = useState("");

  const [editNotes, setEditNotes] = useState("");
  const [activityType, setActivityType] = useState("note");
  const [activityDesc, setActivityDesc] = useState("");

  const fetchClients = async () => {
    try {
      const res = await fetch("/api/clients", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch clients");
      const data = await res.json();
      setClients(data);
    } catch {
      toast({ title: isHe ? "שגיאה" : "Error", description: isHe ? "טעינת לקוחות נכשלה" : "Failed to load clients", variant: "destructive" });
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

  useEffect(() => {
    fetchClients();
  }, []);

  const handleExpand = (client: Client) => {
    if (expandedClientId === client.id) {
      setExpandedClientId(null);
      setActivities([]);
      return;
    }
    setExpandedClientId(client.id);
    setEditNotes(client.notes || "");
    fetchActivities(client.id);
  };

  const handleAddClient = async () => {
    if (!newName.trim()) {
      toast({ title: isHe ? "שגיאה" : "Error", description: isHe ? "שם הלקוח נדרש" : "Client name is required", variant: "destructive" });
      return;
    }
    try {
      await apiRequest("POST", "/api/clients", {
        name: newName.trim(),
        email: newEmail.trim() || null,
        phone: newPhone.trim() || null,
        notes: newNotes.trim() || null,
      });
      toast({ title: isHe ? "הלקוח נוסף" : "Client added", description: isHe ? "הלקוח נוסף בהצלחה" : "Client has been added successfully" });
      setNewName("");
      setNewEmail("");
      setNewPhone("");
      setNewNotes("");
      setShowAddForm(false);
      fetchClients();
    } catch {
      toast({ title: isHe ? "שגיאה" : "Error", description: isHe ? "הוספת לקוח נכשלה" : "Failed to add client", variant: "destructive" });
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

  const handleAddActivity = async (clientId: number) => {
    if (!activityDesc.trim()) return;
    try {
      await apiRequest("POST", `/api/clients/${clientId}/activities`, {
        clientId,
        type: activityType,
        description: activityDesc.trim(),
      });
      toast({ title: isHe ? "פעילות נוספה" : "Activity added", description: isHe ? "הפעילות נוספה בהצלחה" : "Activity has been added successfully" });
      setActivityDesc("");
      setActivityType("note");
      fetchActivities(clientId);
    } catch {
      toast({ title: isHe ? "שגיאה" : "Error", description: isHe ? "הוספת פעילות נכשלה" : "Failed to add activity", variant: "destructive" });
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString(isHe ? "he-IL" : "en-US", {
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
            <Users className="h-5 w-5 text-muted-foreground" />
            <CardTitle>{isHe ? "ניהול לקוחות" : "Client Manager"}</CardTitle>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowAddForm(!showAddForm)}
            data-testid="button-toggle-add-client"
          >
            {showAddForm ? (isHe ? <ChevronUp className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />) : <Plus className="w-4 h-4" />}
            <span className="ml-1">{isHe ? (showAddForm ? "סגור" : "לקוח חדש") : (showAddForm ? "Close" : "New Client")}</span>
          </Button>
        </div>
        <CardDescription>{isHe ? "ניהול לקוחות ומעקב פעילויות" : "Manage clients and track activities"}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {showAddForm && (
          <div className="border rounded-lg p-4 space-y-3" data-testid="add-client-form">
            <h3 className="font-semibold text-sm">{isHe ? "הוספת לקוח חדש" : "Add New Client"}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="client-name">{isHe ? "שם *" : "Name *"}</Label>
                <Input
                  id="client-name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={isHe ? "שם הלקוח" : "Client name"}
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
              <span className="ml-1">{isHe ? "הוסף לקוח" : "Add Client"}</span>
            </Button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : clients.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground" data-testid="empty-clients">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>{isHe ? "אין לקוחות להצגה" : "No clients to display"}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {clients.map((client) => {
              const isExpanded = expandedClientId === client.id;

              return (
                <div
                  key={client.id}
                  className="border rounded-lg"
                  data-testid={`client-${client.id}`}
                >
                  <button
                    onClick={() => handleExpand(client)}
                    className="w-full text-left p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors"
                    data-testid={`button-expand-client-${client.id}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-4 flex-wrap text-sm">
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
                          </span>
                        )}
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
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

                  {isExpanded && (
                    <div className="border-t p-4 space-y-4 bg-muted/20">
                      <div className="space-y-2">
                        <Label>{isHe ? "הערות לקוח" : "Client Notes"}</Label>
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
                        <h4 className="text-sm font-semibold">{isHe ? "הוסף פעילות" : "Add Activity"}</h4>
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
                            <Input
                              value={activityDesc}
                              onChange={(e) => setActivityDesc(e.target.value)}
                              placeholder={isHe ? "תיאור הפעילות" : "Activity description"}
                              data-testid={`input-activity-desc-${client.id}`}
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
                                    {formatDate(activity.createdAt)}
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
