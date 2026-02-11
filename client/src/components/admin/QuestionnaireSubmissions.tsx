import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClipboardList, Eye, CheckCircle, Clock, User, Mail, Phone, Calendar, ChevronDown, ChevronUp, X, Trash2, Filter } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { QUESTIONNAIRES } from "@/lib/questionnaire-data";
import type { QuestionnaireSubmission } from "@shared/schema";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";

const TYPE_LABELS: Record<string, { he: string; en: string; color: string }> = {
  parent: { he: "שאלון להורים", en: "Parent", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
  teacher: { he: "שאלון למורים", en: "Teacher", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
  self_report: { he: "דיווח עצמי", en: "Self-Report", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" },
};

const STATUS_CONFIG: Record<string, { he: string; en: string; color: string }> = {
  new: { he: "חדש", en: "New", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
  reviewed: { he: "נבדק", en: "Reviewed", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
  archived: { he: "בארכיון", en: "Archived", color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300" },
};

const QuestionnaireSubmissions = () => {
  const { language } = useLanguage();
  const isHe = language === 'he';
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const { data: submissions = [], isLoading } = useQuery<QuestionnaireSubmission[]>({
    queryKey: ["/api/questionnaires", typeFilter, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (typeFilter !== 'all') params.append('type', typeFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      const url = `/api/questionnaires?${params.toString()}`;
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const { data: stats } = useQuery<{ total: number; byType: Record<string, number>; unreviewed: number }>({
    queryKey: ["/api/questionnaires/stats"],
    queryFn: async () => {
      const res = await fetch("/api/questionnaires/stats", { credentials: 'include' });
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await apiRequest("PATCH", `/api/questionnaires/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/questionnaires"] });
      queryClient.invalidateQueries({ queryKey: ["/api/questionnaires/stats"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/questionnaires/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/questionnaires"] });
      queryClient.invalidateQueries({ queryKey: ["/api/questionnaires/stats"] });
      setExpandedId(null);
    },
  });

  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    return d.toLocaleString("he-IL", {
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
            <ClipboardList className="h-5 w-5 text-muted-foreground" />
            <CardTitle>{isHe ? "שאלוני הערכה שהוגשו" : "Questionnaire Submissions"}</CardTitle>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {stats && (
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="secondary" className="no-default-hover-elevate no-default-active-elevate">
                  {stats.total} {isHe ? 'סה"כ' : "total"}
                </Badge>
              </div>
            )}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[130px] h-8 text-xs">
                <SelectValue placeholder={isHe ? "סוג" : "Type"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isHe ? "כל הסוגים" : "All Types"}</SelectItem>
                <SelectItem value="parent">{isHe ? "הורים" : "Parent"}</SelectItem>
                <SelectItem value="teacher">{isHe ? "מורים" : "Teacher"}</SelectItem>
                <SelectItem value="self_report">{isHe ? "דיווח עצמי" : "Self-Report"}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px] h-8 text-xs">
                <div className="flex items-center gap-1.5">
                  <Filter className="h-3.5 w-3.5" />
                  <SelectValue placeholder={isHe ? "סטטוס" : "Status"} />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isHe ? "כל הסטטוסים" : "All Statuses"}</SelectItem>
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{isHe ? config.he : config.en}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <CardDescription>{isHe ? "צפייה וניהול תשובות שאלונים מלקוחות" : "View and manage questionnaire responses from clients"}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>{isHe ? "אין שאלונים להצגה" : "No questionnaires to display"}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {submissions.map((sub) => {
              const typeInfo = TYPE_LABELS[sub.type] || TYPE_LABELS.parent;
              const statusInfo = STATUS_CONFIG[sub.status] || STATUS_CONFIG.new;
              const isExpanded = expandedId === sub.id;
              const scores = sub.scores as Record<string, number> | null;
              const answersMap = sub.answers as Record<string, number>;

              return (
                <div
                  key={sub.id}
                  className={cn(
                    "border rounded-lg overflow-hidden transition-colors",
                    sub.status === 'new' && "border-primary/30 bg-primary/5"
                  )}
                  data-testid={`submission-${sub.id}`}
                >
                  <div className="flex items-center justify-between p-4 gap-3">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : sub.id)}
                      className="flex-1 text-start flex items-center gap-3 min-w-0"
                      data-testid={`button-toggle-submission-${sub.id}`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", typeInfo.color)}>
                            {isHe ? typeInfo.he : typeInfo.en}
                          </span>
                          <Badge variant="secondary" className={cn("text-[10px] px-1.5 py-0 leading-none", statusInfo.color)}>
                            {isHe ? statusInfo.he : statusInfo.en}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 flex-wrap text-sm">
                          <span className="font-medium flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-muted-foreground" />
                            {sub.respondentName}
                          </span>
                          <span className="text-muted-foreground flex items-center gap-1 hidden sm:flex">
                            <Mail className="w-3.5 h-3.5" />
                            {sub.respondentEmail}
                          </span>
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(sub.createdAt)}
                          </span>
                        </div>
                      </div>
                    </button>
                    <div className="flex items-center gap-2 shrink-0">
                      <Select 
                        value={sub.status} 
                        onValueChange={(status) => updateStatus.mutate({ id: sub.id, status })}
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
                        className="text-destructive border-destructive/30 h-8 w-8 p-0"
                        onClick={() => {
                          if (window.confirm(isHe ? `למחוק את השאלון של ${sub.respondentName}?` : `Delete questionnaire from ${sub.respondentName}?`)) {
                            deleteMutation.mutate(sub.id)
                          }
                        }}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <button onClick={() => setExpandedId(isExpanded ? null : sub.id)}>
                        {isExpanded ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t p-4 space-y-4 bg-muted/20">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="flex flex-col gap-1">
                          <p className="text-xs text-muted-foreground">{isHe ? "טלפון" : "Phone"}</p>
                          <p className="font-medium text-sm">{sub.respondentPhone}</p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <p className="text-xs text-muted-foreground">{isHe ? "אימייל" : "Email"}</p>
                          <p className="font-medium text-sm truncate">{sub.respondentEmail}</p>
                        </div>
                        {sub.childName && (
                          <div className="flex flex-col gap-1">
                            <p className="text-xs text-muted-foreground">{isHe ? "שם הילד/ה" : "Child Name"}</p>
                            <p className="font-medium text-sm">{sub.childName}</p>
                          </div>
                        )}
                        {sub.childAge && (
                          <div className="flex flex-col gap-1">
                            <p className="text-xs text-muted-foreground">{isHe ? "גיל הילד/ה" : "Child Age"}</p>
                            <p className="font-medium text-sm">{sub.childAge}</p>
                          </div>
                        )}
                      </div>

                      {scores && (
                        <div>
                          <h4 className="text-sm font-semibold mb-2">{isHe ? "ציונים" : "Scores"}</h4>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {Object.entries(scores).map(([key, value]) => (
                              <div key={key} className="bg-background rounded-md p-2 border text-center">
                                <p className="text-xs text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                                <p className="text-lg font-bold text-primary">{value}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {answersMap && (
                        <div>
                          <h4 className="text-sm font-semibold mb-2">{isHe ? "תשובות מפורטות" : "Detailed Answers"}</h4>
                          <div className="max-h-[400px] overflow-y-auto">
                            {QUESTIONNAIRES[sub.type as keyof typeof QUESTIONNAIRES]?.sections.map((section) => (
                              <div key={section.id} className="mb-3">
                                <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                                  {isHe ? section.titleHe : section.titleEn}
                                </h5>
                                <div className="space-y-1">
                                  {section.questions.map((q) => {
                                    const val = answersMap[q.id];
                                    return (
                                      <div key={q.id} className="flex items-start gap-2 text-sm bg-background rounded p-2 border">
                                        <span className="flex-1 text-foreground/80">{isHe ? q.he : q.en}</span>
                                        <Badge
                                          variant="secondary"
                                          className={cn(
                                            "shrink-0 no-default-hover-elevate no-default-active-elevate",
                                            val >= 3 && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
                                            val === 2 && "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                                          )}
                                        >
                                          {val}
                                        </Badge>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {sub.notes && (
                        <div>
                          <h4 className="text-sm font-semibold mb-1">{isHe ? "הערות" : "Notes"}</h4>
                          <p className="text-sm text-muted-foreground bg-background rounded-md p-3 border">{sub.notes}</p>
                        </div>
                      )}
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

export default QuestionnaireSubmissions;
