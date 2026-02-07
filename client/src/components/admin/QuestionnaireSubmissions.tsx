import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClipboardList, Eye, CheckCircle, Clock, User, Mail, Phone, Calendar, ChevronDown, ChevronUp, X } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { QUESTIONNAIRES } from "@/lib/questionnaire-data";
import type { QuestionnaireSubmission } from "@shared/schema";
import { cn } from "@/lib/utils";

const TYPE_LABELS: Record<string, { he: string; en: string; color: string }> = {
  parent: { he: "שאלון להורים", en: "Parent", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
  teacher: { he: "שאלון למורים", en: "Teacher", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
  self_report: { he: "דיווח עצמי", en: "Self-Report", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" },
};

const QuestionnaireSubmissions = () => {
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const { data: submissions = [], isLoading } = useQuery<QuestionnaireSubmission[]>({
    queryKey: ["/api/questionnaires", typeFilter],
    queryFn: async () => {
      const url = typeFilter === "all" ? "/api/questionnaires" : `/api/questionnaires?type=${typeFilter}`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const { data: stats } = useQuery<{ total: number; byType: Record<string, number>; unreviewed: number }>({
    queryKey: ["/api/questionnaires/stats"],
    queryFn: async () => {
      const res = await fetch("/api/questionnaires/stats", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
  });

  const markReviewed = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("PATCH", `/api/questionnaires/${id}/reviewed`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/questionnaires", typeFilter] });
      queryClient.invalidateQueries({ queryKey: ["/api/questionnaires/stats"] });
    },
  });

  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    return d.toLocaleDateString("he-IL", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Questionnaire Submissions</CardTitle>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {stats && (
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="secondary" className="no-default-hover-elevate no-default-active-elevate">
                  {stats.total} total
                </Badge>
                {stats.unreviewed > 0 && (
                  <Badge variant="destructive" className="no-default-hover-elevate no-default-active-elevate">
                    {stats.unreviewed} new
                  </Badge>
                )}
              </div>
            )}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]" data-testid="select-submission-filter">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="parent">Parent</SelectItem>
                <SelectItem value="teacher">Teacher</SelectItem>
                <SelectItem value="self_report">Self-Report</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <CardDescription>View and manage questionnaire responses from clients</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No questionnaire submissions yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {submissions.map((sub) => {
              const typeInfo = TYPE_LABELS[sub.type] || TYPE_LABELS.parent;
              const isExpanded = expandedId === sub.id;
              const scores = sub.scores as Record<string, number> | null;
              const answersMap = sub.answers as Record<string, number>;

              return (
                <div
                  key={sub.id}
                  className={cn(
                    "border rounded-lg overflow-hidden transition-colors",
                    !sub.reviewed && "border-primary/30 bg-primary/5"
                  )}
                  data-testid={`submission-${sub.id}`}
                >
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : sub.id)}
                    className="w-full text-left p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors"
                    data-testid={`button-toggle-submission-${sub.id}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", typeInfo.color)}>
                          {typeInfo.en}
                        </span>
                        {!sub.reviewed && (
                          <Badge variant="outline" className="text-xs no-default-hover-elevate no-default-active-elevate border-orange-300 text-orange-600 dark:text-orange-400">
                            <Clock className="w-3 h-3 mr-1" />
                            New
                          </Badge>
                        )}
                        {sub.reviewed && (
                          <Badge variant="outline" className="text-xs no-default-hover-elevate no-default-active-elevate border-green-300 text-green-600 dark:text-green-400">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Reviewed
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 flex-wrap text-sm">
                        <span className="font-medium flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-muted-foreground" />
                          {sub.respondentName}
                        </span>
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5" />
                          {sub.respondentEmail}
                        </span>
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5" />
                          {sub.respondentPhone}
                        </span>
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(sub.createdAt)}
                        </span>
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-muted-foreground shrink-0" /> : <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />}
                  </button>

                  {isExpanded && (
                    <div className="border-t p-4 space-y-4 bg-muted/20">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {sub.childName && (
                          <div>
                            <p className="text-xs text-muted-foreground">Child Name</p>
                            <p className="font-medium text-sm">{sub.childName}</p>
                          </div>
                        )}
                        {sub.childAge && (
                          <div>
                            <p className="text-xs text-muted-foreground">Child Age</p>
                            <p className="font-medium text-sm">{sub.childAge}</p>
                          </div>
                        )}
                        {sub.childGender && (
                          <div>
                            <p className="text-xs text-muted-foreground">Gender</p>
                            <p className="font-medium text-sm capitalize">{sub.childGender}</p>
                          </div>
                        )}
                        {sub.relationship && (
                          <div>
                            <p className="text-xs text-muted-foreground">Relationship</p>
                            <p className="font-medium text-sm capitalize">{sub.relationship}</p>
                          </div>
                        )}
                      </div>

                      {scores && (
                        <div>
                          <h4 className="text-sm font-semibold mb-2">Scores</h4>
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
                          <h4 className="text-sm font-semibold mb-2">Detailed Answers</h4>
                          <div className="max-h-[400px] overflow-y-auto">
                            {QUESTIONNAIRES[sub.type as keyof typeof QUESTIONNAIRES]?.sections.map((section) => (
                              <div key={section.id} className="mb-3">
                                <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                                  {section.titleEn}
                                </h5>
                                <div className="space-y-1">
                                  {section.questions.map((q) => {
                                    const val = answersMap[q.id];
                                    return (
                                      <div key={q.id} className="flex items-start gap-2 text-sm bg-background rounded p-2 border">
                                        <span className="flex-1 text-foreground/80">{q.en}</span>
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
                          <h4 className="text-sm font-semibold mb-1">Notes</h4>
                          <p className="text-sm text-muted-foreground bg-background rounded-md p-3 border">{sub.notes}</p>
                        </div>
                      )}

                      <div className="flex items-center justify-end gap-2 pt-2">
                        {!sub.reviewed && (
                          <Button
                            variant="outline"
                            onClick={() => markReviewed.mutate(sub.id)}
                            disabled={markReviewed.isPending}
                            data-testid={`button-mark-reviewed-${sub.id}`}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            {markReviewed.isPending ? "Marking..." : "Mark as Reviewed"}
                          </Button>
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

export default QuestionnaireSubmissions;
