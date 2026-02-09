import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, ClipboardList, Send, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { QUESTIONNAIRES, RATING_OPTIONS, PERFORMANCE_OPTIONS, calculateScores, type QuestionnaireType } from "@/lib/questionnaire-data";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

type Step = "register" | "form" | "success";

interface RespondentInfo {
  respondentName: string;
  respondentEmail: string;
  respondentPhone: string;
  childName: string;
  childAge: string;
  childGender: string;
  relationship: string;
}

interface QuestionnaireModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: QuestionnaireType;
}

const QuestionnaireModal: React.FC<QuestionnaireModalProps> = ({ open, onOpenChange, type }) => {
  const config = QUESTIONNAIRES[type];
  const { isRTL } = useLanguage();
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [step, setStep] = useState<Step>("register");
  const [currentSection, setCurrentSection] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [respondent, setRespondent] = useState<RespondentInfo>({
    respondentName: "",
    respondentEmail: "",
    respondentPhone: "",
    childName: "",
    childAge: "",
    childGender: "",
    relationship: "",
  });
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isHebrew = isRTL;
  const title = config ? (isHebrew ? config.titleHe : config.titleEn) : "";
  const description = config ? (isHebrew ? config.descriptionHe : config.descriptionEn) : "";
  const dir = isRTL ? "rtl" : "ltr";
  const NextArrow = isRTL ? ChevronLeft : ChevronRight;
  const PrevArrow = isRTL ? ChevronRight : ChevronLeft;

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;
  if (!config) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" data-testid="questionnaire-modal-overlay">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
        <div className="relative z-10 bg-background rounded-xl p-8 text-center max-w-sm">
          <p className="mb-4">{isRTL ? "סוג שאלון לא תקין" : "Invalid questionnaire type"}</p>
          <Button onClick={() => onOpenChange(false)}>{isRTL ? "סגירה" : "Close"}</Button>
        </div>
      </div>
    );
  }

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setStep("register");
      setCurrentSection(0);
      setRespondent({
        respondentName: "",
        respondentEmail: "",
        respondentPhone: "",
        childName: "",
        childAge: "",
        childGender: "",
        relationship: "",
      });
      setAnswers({});
      setNotes("");
      setErrors({});
    }, 300);
  };

  const validateRegistration = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!respondent.respondentName.trim()) {
      newErrors.respondentName = isHebrew ? "שם מלא הוא שדה חובה" : "Full name is required";
    }
    if (!respondent.respondentEmail.trim() || !/\S+@\S+\.\S+/.test(respondent.respondentEmail)) {
      newErrors.respondentEmail = isHebrew ? "כתובת אימייל תקינה נדרשת" : "Valid email is required";
    }
    if (!respondent.respondentPhone.trim() || respondent.respondentPhone.replace(/\D/g, "").length < 7) {
      newErrors.respondentPhone = isHebrew ? "מספר טלפון תקין נדרש" : "Valid phone number is required";
    }
    if (config.requiresChildInfo) {
      if (!respondent.childName.trim()) {
        newErrors.childName = isHebrew ? "שם הילד/ה הוא שדה חובה" : "Child's name is required";
      }
      if (!respondent.childAge.trim() || isNaN(Number(respondent.childAge)) || Number(respondent.childAge) < 1) {
        newErrors.childAge = isHebrew ? "גיל תקין נדרש" : "Valid age is required";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateRegistration()) {
      setStep("form");
      scrollToTop();
    }
  };

  const currentSectionData = config.sections[currentSection];
  const isPerformanceSection = currentSectionData?.id === "performance" || currentSectionData?.id === "daily_life";
  const ratingOptions = isPerformanceSection ? PERFORMANCE_OPTIONS : RATING_OPTIONS;

  const sectionQuestionIds = currentSectionData?.questions.map((q) => q.id) || [];
  const sectionAnswered = sectionQuestionIds.filter((id) => answers[id] !== undefined).length;
  const sectionTotal = sectionQuestionIds.length;
  const allQuestionIds = config.sections.flatMap((s) => s.questions.map((q) => q.id));
  const totalAnswered = allQuestionIds.filter((id) => answers[id] !== undefined).length;
  const totalQuestions = allQuestionIds.length;

  const handleAnswer = (questionId: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    const unanswered = allQuestionIds.filter((id) => answers[id] === undefined);
    if (unanswered.length > 0) {
      toast({
        title: isHebrew ? "שאלות לא נענו" : "Unanswered Questions",
        description: isHebrew
          ? `יש ${unanswered.length} שאלות שלא נענו. אנא ענה/י על כל השאלות.`
          : `There are ${unanswered.length} unanswered questions. Please answer all questions.`,
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const scores = calculateScores(type, answers);
      const payload = {
        type,
        respondentName: respondent.respondentName,
        respondentEmail: respondent.respondentEmail,
        respondentPhone: respondent.respondentPhone,
        childName: config.requiresChildInfo ? respondent.childName : null,
        childAge: config.requiresChildInfo && respondent.childAge ? parseInt(respondent.childAge) : null,
        childGender: config.requiresChildInfo ? respondent.childGender || null : null,
        relationship: config.requiresChildInfo ? respondent.relationship || null : null,
        answers,
        scores,
        notes: notes || null,
      };

      await apiRequest("POST", "/api/questionnaires/submit", payload);
      setStep("success");
      scrollToTop();
    } catch (error) {
      toast({
        title: isHebrew ? "שגיאה" : "Error",
        description: isHebrew ? "שליחת השאלון נכשלה. אנא נסו שוב." : "Failed to submit questionnaire. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4"
      data-testid="questionnaire-modal-overlay"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      <div
        className="relative z-10 w-full max-w-2xl max-h-[95vh] flex flex-col rounded-xl border-2 border-primary bg-background shadow-2xl"
        dir={dir}
        data-testid="questionnaire-modal-content"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-2 px-4 sm:px-6 py-3 sm:py-4 border-b border-border bg-background rounded-t-xl">
          <div className="flex-1 min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2 truncate">
              <ClipboardList className="h-5 w-5 text-primary shrink-0" />
              {title}
            </h2>
            {step === "form" && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {totalAnswered}/{totalQuestions} {isHebrew ? "שאלות נענו" : "questions answered"}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            data-testid="button-close-questionnaire"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5">
          {step === "register" && (
            <div>
              <div className="text-center mb-5">
                <div className="w-14 h-14 mx-auto mb-3 bg-primary/10 rounded-full flex items-center justify-center">
                  <ClipboardList className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold" data-testid="text-questionnaire-modal-title">{title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{description}</p>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-3 mb-3">
                  <h3 className="font-semibold mb-0.5 text-sm">
                    {isHebrew ? "פרטים אישיים" : "Personal Information"}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {isHebrew ? "אנא מלאו את הפרטים שלכם לפני מילוי השאלון" : "Please fill in your details before completing the questionnaire"}
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label htmlFor="qm-respondentName">{isHebrew ? "שם מלא *" : "Full Name *"}</Label>
                    <Input
                      id="qm-respondentName"
                      value={respondent.respondentName}
                      onChange={(e) => setRespondent((p) => ({ ...p, respondentName: e.target.value }))}
                      placeholder={isHebrew ? "הכניסו את שמכם המלא" : "Enter your full name"}
                      data-testid="input-modal-respondent-name"
                    />
                    {errors.respondentName && <p className="text-destructive text-xs mt-1">{errors.respondentName}</p>}
                  </div>

                  <div>
                    <Label htmlFor="qm-respondentEmail">{isHebrew ? 'דוא"ל *' : "Email *"}</Label>
                    <Input
                      id="qm-respondentEmail"
                      type="email"
                      value={respondent.respondentEmail}
                      onChange={(e) => setRespondent((p) => ({ ...p, respondentEmail: e.target.value }))}
                      placeholder="your@email.com"
                      data-testid="input-modal-respondent-email"
                    />
                    {errors.respondentEmail && <p className="text-destructive text-xs mt-1">{errors.respondentEmail}</p>}
                  </div>

                  <div>
                    <Label htmlFor="qm-respondentPhone">{isHebrew ? "טלפון *" : "Phone *"}</Label>
                    <Input
                      id="qm-respondentPhone"
                      type="tel"
                      value={respondent.respondentPhone}
                      onChange={(e) => setRespondent((p) => ({ ...p, respondentPhone: e.target.value }))}
                      placeholder="050-1234567"
                      data-testid="input-modal-respondent-phone"
                    />
                    {errors.respondentPhone && <p className="text-destructive text-xs mt-1">{errors.respondentPhone}</p>}
                  </div>
                </div>

                {config.requiresChildInfo && (
                  <>
                    <div className="bg-muted/50 rounded-lg p-3 mt-4 mb-2">
                      <h3 className="font-semibold mb-0.5 text-sm">
                        {isHebrew ? "פרטי הילד/ה" : "Child's Information"}
                      </h3>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="qm-childName">{isHebrew ? "שם הילד/ה *" : "Child's Name *"}</Label>
                        <Input
                          id="qm-childName"
                          value={respondent.childName}
                          onChange={(e) => setRespondent((p) => ({ ...p, childName: e.target.value }))}
                          placeholder={isHebrew ? "שם מלא של הילד/ה" : "Child's full name"}
                          data-testid="input-modal-child-name"
                        />
                        {errors.childName && <p className="text-destructive text-xs mt-1">{errors.childName}</p>}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="qm-childAge">{isHebrew ? "גיל *" : "Age *"}</Label>
                          <Input
                            id="qm-childAge"
                            type="number"
                            min="1"
                            max="120"
                            value={respondent.childAge}
                            onChange={(e) => setRespondent((p) => ({ ...p, childAge: e.target.value }))}
                            placeholder={isHebrew ? "גיל" : "Age"}
                            data-testid="input-modal-child-age"
                          />
                          {errors.childAge && <p className="text-destructive text-xs mt-1">{errors.childAge}</p>}
                        </div>

                        <div>
                          <Label htmlFor="qm-childGender">{isHebrew ? "מין" : "Gender"}</Label>
                          <Select
                            value={respondent.childGender}
                            onValueChange={(v) => setRespondent((p) => ({ ...p, childGender: v }))}
                          >
                            <SelectTrigger id="qm-childGender" data-testid="select-modal-child-gender">
                              <SelectValue placeholder={isHebrew ? "בחר/י" : "Select"} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">{isHebrew ? "זכר" : "Male"}</SelectItem>
                              <SelectItem value="female">{isHebrew ? "נקבה" : "Female"}</SelectItem>
                              <SelectItem value="other">{isHebrew ? "אחר" : "Other"}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="qm-relationship">{isHebrew ? "קרבה לילד/ה" : "Relationship to Child"}</Label>
                        <Select
                          value={respondent.relationship}
                          onValueChange={(v) => setRespondent((p) => ({ ...p, relationship: v }))}
                        >
                          <SelectTrigger id="qm-relationship" data-testid="select-modal-relationship">
                            <SelectValue placeholder={isHebrew ? "בחר/י" : "Select"} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="parent">{isHebrew ? "הורה" : "Parent"}</SelectItem>
                            <SelectItem value="guardian">{isHebrew ? "אפוטרופוס" : "Guardian"}</SelectItem>
                            <SelectItem value="teacher">{isHebrew ? "מורה" : "Teacher"}</SelectItem>
                            <SelectItem value="other">{isHebrew ? "אחר" : "Other"}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </>
                )}

                <Button type="submit" className="w-full mt-4" data-testid="button-modal-start-questionnaire">
                  {isHebrew ? "התחל/י את השאלון" : "Start Questionnaire"}
                  <NextArrow className="w-4 h-4 ml-2" />
                </Button>
              </form>
            </div>
          )}

          {step === "form" && currentSectionData && (
            <div className="space-y-4">
              <div className="flex gap-1 overflow-x-auto pb-2">
                {config.sections.map((section, idx) => {
                  const sIds = section.questions.map((q) => q.id);
                  const answered = sIds.filter((id) => answers[id] !== undefined).length;
                  const complete = answered === sIds.length;
                  return (
                    <button
                      key={section.id}
                      onClick={() => { setCurrentSection(idx); scrollToTop(); }}
                      className={cn(
                        "flex-shrink-0 px-3 py-2 rounded-md text-sm font-medium transition-colors border",
                        idx === currentSection
                          ? "bg-primary text-primary-foreground border-primary"
                          : complete
                          ? "bg-primary/10 text-primary border-primary/30"
                          : "bg-muted/50 text-muted-foreground border-border"
                      )}
                      data-testid={`button-modal-section-${section.id}`}
                    >
                      {isHebrew ? section.titleHe : section.titleEn}
                      {complete && <CheckCircle className="w-3 h-3 inline-block ml-1" />}
                    </button>
                  );
                })}
              </div>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">
                    {isHebrew ? currentSectionData.titleHe : currentSectionData.titleEn}
                  </CardTitle>
                  <CardDescription>
                    {sectionAnswered}/{sectionTotal} {isHebrew ? "שאלות נענו" : "answered"}
                  </CardDescription>
                  <div className="w-full bg-muted rounded-full h-2 mt-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${sectionTotal > 0 ? (sectionAnswered / sectionTotal) * 100 : 0}%` }}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isPerformanceSection && (
                    <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
                      {isHebrew
                        ? "דרגו את הביצועים בכל תחום (1 = מצוין, 5 = בעייתי)"
                        : "Rate performance in each area (1 = Excellent, 5 = Problematic)"}
                    </div>
                  )}

                  {currentSectionData.questions.map((question, qIdx) => {
                    const selected = answers[question.id];
                    return (
                      <div
                        key={question.id}
                        className={cn(
                          "p-3 rounded-lg border transition-colors",
                          selected !== undefined ? "bg-primary/5 border-primary/20" : "bg-card border-border"
                        )}
                        data-testid={`modal-question-${question.id}`}
                      >
                        <p className="font-medium mb-2 text-sm">
                          <span className="text-muted-foreground mr-2">{qIdx + 1}.</span>
                          {isHebrew ? question.he : question.en}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {ratingOptions.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => handleAnswer(question.id, option.value)}
                              className={cn(
                                "px-2.5 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all border min-w-[50px]",
                                selected === option.value
                                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                  : "bg-card text-foreground border-border"
                              )}
                              data-testid={`modal-answer-${question.id}-${option.value}`}
                            >
                              {isHebrew ? option.he : option.en}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {currentSection === config.sections.length - 1 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{isHebrew ? "הערות נוספות" : "Additional Notes"}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={isHebrew ? "הוסיפו הערות או מידע נוסף (אופציונלי)..." : "Add any additional notes or information (optional)..."}
                      className="min-h-[80px]"
                      data-testid="input-modal-notes"
                    />
                  </CardContent>
                </Card>
              )}

              <div className="flex items-center justify-between gap-3 pt-2 pb-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (currentSection > 0) {
                      setCurrentSection((p) => p - 1);
                      scrollToTop();
                    } else {
                      setStep("register");
                      scrollToTop();
                    }
                  }}
                  data-testid="button-modal-prev-section"
                >
                  <PrevArrow className="w-4 h-4 mr-1" />
                  {currentSection === 0
                    ? isHebrew ? "חזרה לפרטים" : "Back to Details"
                    : isHebrew ? "הקודם" : "Previous"}
                </Button>

                {currentSection < config.sections.length - 1 ? (
                  <Button
                    onClick={() => {
                      setCurrentSection((p) => p + 1);
                      scrollToTop();
                    }}
                    data-testid="button-modal-next-section"
                  >
                    {isHebrew ? "הבא" : "Next"}
                    <NextArrow className="w-4 h-4 ml-1" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting}
                    data-testid="button-modal-submit-questionnaire"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {submitting
                      ? isHebrew ? "שולח..." : "Submitting..."
                      : isHebrew ? "שלח/י שאלון" : "Submit Questionnaire"}
                  </Button>
                )}
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="text-center py-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-xl font-bold mb-2" data-testid="text-modal-success-title">
                {isHebrew ? "השאלון נשלח בהצלחה!" : "Questionnaire Submitted Successfully!"}
              </h2>
              <p className="text-muted-foreground mb-2 text-sm max-w-sm mx-auto" data-testid="text-modal-success-desc">
                {isHebrew
                  ? "תודה על מילוי השאלון. הצוות שלנו יעבור על התוצאות ויצור עמכם קשר."
                  : "Thank you for completing the questionnaire. Our team will review the results and contact you."}
              </p>
              <p className="text-xs text-muted-foreground mb-5">
                {respondent.respondentName} - {respondent.respondentEmail}
              </p>
              <Button onClick={handleClose} data-testid="button-modal-close-success">
                {isHebrew ? "סגירה" : "Close"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionnaireModal;
