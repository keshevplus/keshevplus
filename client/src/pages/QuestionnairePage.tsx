import { useState } from "react";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, CheckCircle, ClipboardList, Send, ChevronLeft, ChevronRight } from "lucide-react";
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

const QuestionnairePage = () => {
  const [, params] = useRoute("/questionnaire/:type");
  const type = (params?.type || "parent") as QuestionnaireType;
  const config = QUESTIONNAIRES[type];
  const { isRTL } = useLanguage();
  const { toast } = useToast();

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

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <p className="text-lg mb-4" data-testid="text-invalid-type">Invalid questionnaire type</p>
            <Link href="/">
              <Button data-testid="link-home">Return Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isHebrew = isRTL;
  const title = isHebrew ? config.titleHe : config.titleEn;
  const description = isHebrew ? config.descriptionHe : config.descriptionEn;
  const dir = isRTL ? "rtl" : "ltr";
  const BackArrow = isRTL ? ArrowRight : ArrowLeft;
  const NextArrow = isRTL ? ChevronLeft : ChevronRight;
  const PrevArrow = isRTL ? ChevronRight : ChevronLeft;

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
      window.scrollTo(0, 0);
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
      window.scrollTo(0, 0);
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
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20" dir={dir}>
      <header className="bg-background/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/#questionnaires">
            <Button variant="ghost" size="icon" data-testid="button-back-home">
              <BackArrow className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold truncate" data-testid="text-questionnaire-title">{title}</h1>
            {step === "form" && (
              <p className="text-xs text-muted-foreground">
                {totalAnswered}/{totalQuestions} {isHebrew ? "שאלות נענו" : "questions answered"}
              </p>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        {step === "form" && (
          <div className="flex gap-1 mb-6 overflow-x-auto pb-2">
            {config.sections.map((section, idx) => {
              const sIds = section.questions.map((q) => q.id);
              const answered = sIds.filter((id) => answers[id] !== undefined).length;
              const complete = answered === sIds.length;
              return (
                <button
                  key={section.id}
                  onClick={() => setCurrentSection(idx)}
                  className={cn(
                    "flex-shrink-0 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    "border",
                    idx === currentSection
                      ? "bg-primary text-primary-foreground border-primary"
                      : complete
                      ? "bg-primary/10 text-primary border-primary/30"
                      : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"
                  )}
                  data-testid={`button-section-${section.id}`}
                >
                  {isHebrew ? section.titleHe : section.titleEn}
                  {complete && <CheckCircle className="w-3 h-3 inline-block ml-1" />}
                </button>
              );
            })}
          </div>
        )}

        {step === "register" && (
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <ClipboardList className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">{title}</CardTitle>
              <CardDescription className="text-base">{description}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4 mb-4">
                  <h3 className="font-semibold mb-1 text-sm">
                    {isHebrew ? "פרטים אישיים" : "Personal Information"}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {isHebrew ? "אנא מלאו את הפרטים שלכם לפני מילוי השאלון" : "Please fill in your details before completing the questionnaire"}
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label htmlFor="respondentName">{isHebrew ? "שם מלא *" : "Full Name *"}</Label>
                    <Input
                      id="respondentName"
                      value={respondent.respondentName}
                      onChange={(e) => setRespondent((p) => ({ ...p, respondentName: e.target.value }))}
                      placeholder={isHebrew ? "הכניסו את שמכם המלא" : "Enter your full name"}
                      data-testid="input-respondent-name"
                    />
                    {errors.respondentName && <p className="text-destructive text-xs mt-1">{errors.respondentName}</p>}
                  </div>

                  <div>
                    <Label htmlFor="respondentEmail">{isHebrew ? 'דוא"ל *' : "Email *"}</Label>
                    <Input
                      id="respondentEmail"
                      type="email"
                      value={respondent.respondentEmail}
                      onChange={(e) => setRespondent((p) => ({ ...p, respondentEmail: e.target.value }))}
                      placeholder={isHebrew ? "your@email.com" : "your@email.com"}
                      data-testid="input-respondent-email"
                    />
                    {errors.respondentEmail && <p className="text-destructive text-xs mt-1">{errors.respondentEmail}</p>}
                  </div>

                  <div>
                    <Label htmlFor="respondentPhone">{isHebrew ? "טלפון *" : "Phone *"}</Label>
                    <Input
                      id="respondentPhone"
                      type="tel"
                      value={respondent.respondentPhone}
                      onChange={(e) => setRespondent((p) => ({ ...p, respondentPhone: e.target.value }))}
                      placeholder={isHebrew ? "050-1234567" : "050-1234567"}
                      data-testid="input-respondent-phone"
                    />
                    {errors.respondentPhone && <p className="text-destructive text-xs mt-1">{errors.respondentPhone}</p>}
                  </div>
                </div>

                {config.requiresChildInfo && (
                  <>
                    <div className="bg-muted/50 rounded-lg p-4 mt-6 mb-2">
                      <h3 className="font-semibold mb-1 text-sm">
                        {isHebrew ? "פרטי הילד/ה" : "Child's Information"}
                      </h3>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="childName">{isHebrew ? "שם הילד/ה *" : "Child's Name *"}</Label>
                        <Input
                          id="childName"
                          value={respondent.childName}
                          onChange={(e) => setRespondent((p) => ({ ...p, childName: e.target.value }))}
                          placeholder={isHebrew ? "שם מלא של הילד/ה" : "Child's full name"}
                          data-testid="input-child-name"
                        />
                        {errors.childName && <p className="text-destructive text-xs mt-1">{errors.childName}</p>}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="childAge">{isHebrew ? "גיל *" : "Age *"}</Label>
                          <Input
                            id="childAge"
                            type="number"
                            min="1"
                            max="120"
                            value={respondent.childAge}
                            onChange={(e) => setRespondent((p) => ({ ...p, childAge: e.target.value }))}
                            placeholder={isHebrew ? "גיל" : "Age"}
                            data-testid="input-child-age"
                          />
                          {errors.childAge && <p className="text-destructive text-xs mt-1">{errors.childAge}</p>}
                        </div>

                        <div>
                          <Label htmlFor="childGender">{isHebrew ? "מין" : "Gender"}</Label>
                          <Select
                            value={respondent.childGender}
                            onValueChange={(v) => setRespondent((p) => ({ ...p, childGender: v }))}
                          >
                            <SelectTrigger id="childGender" data-testid="select-child-gender">
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
                        <Label htmlFor="relationship">{isHebrew ? "קרבה לילד/ה" : "Relationship to Child"}</Label>
                        <Select
                          value={respondent.relationship}
                          onValueChange={(v) => setRespondent((p) => ({ ...p, relationship: v }))}
                        >
                          <SelectTrigger id="relationship" data-testid="select-relationship">
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

                <Button type="submit" className="w-full mt-6" data-testid="button-start-questionnaire">
                  {isHebrew ? "התחל/י את השאלון" : "Start Questionnaire"}
                  <NextArrow className="w-4 h-4 ml-2" />
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {step === "form" && currentSectionData && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">
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
              <CardContent className="space-y-6">
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
                        "p-4 rounded-lg border transition-colors",
                        selected !== undefined ? "bg-primary/5 border-primary/20" : "bg-card border-border"
                      )}
                      data-testid={`question-${question.id}`}
                    >
                      <p className="font-medium mb-3 text-sm sm:text-base">
                        <span className="text-muted-foreground mr-2">{qIdx + 1}.</span>
                        {isHebrew ? question.he : question.en}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {ratingOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => handleAnswer(question.id, option.value)}
                            className={cn(
                              "px-3 py-2 rounded-md text-sm font-medium transition-all border min-w-[60px]",
                              selected === option.value
                                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                : "bg-card text-foreground border-border hover:bg-muted"
                            )}
                            data-testid={`answer-${question.id}-${option.value}`}
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
                <CardHeader>
                  <CardTitle className="text-lg">{isHebrew ? "הערות נוספות" : "Additional Notes"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={isHebrew ? "הוסיפו הערות או מידע נוסף (אופציונלי)..." : "Add any additional notes or information (optional)..."}
                    className="min-h-[100px]"
                    data-testid="input-notes"
                  />
                </CardContent>
              </Card>
            )}

            <div className="flex items-center justify-between gap-3 pt-2 pb-8">
              <Button
                variant="outline"
                onClick={() => {
                  if (currentSection > 0) {
                    setCurrentSection((p) => p - 1);
                    window.scrollTo(0, 0);
                  } else {
                    setStep("register");
                  }
                }}
                data-testid="button-prev-section"
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
                    window.scrollTo(0, 0);
                  }}
                  data-testid="button-next-section"
                >
                  {isHebrew ? "הבא" : "Next"}
                  <NextArrow className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  data-testid="button-submit-questionnaire"
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
          <Card className="text-center">
            <CardContent className="pt-8 pb-8">
              <div className="w-20 h-20 mx-auto mb-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold mb-3" data-testid="text-success-title">
                {isHebrew ? "השאלון נשלח בהצלחה!" : "Questionnaire Submitted Successfully!"}
              </h2>
              <p className="text-muted-foreground mb-2 max-w-md mx-auto" data-testid="text-success-desc">
                {isHebrew
                  ? "תודה על מילוי השאלון. הצוות שלנו יעבור על התוצאות ויצור עמכם קשר."
                  : "Thank you for completing the questionnaire. Our team will review the results and contact you."}
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                {respondent.respondentName} - {respondent.respondentEmail}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/">
                  <Button variant="outline" data-testid="link-home-from-success">
                    <BackArrow className="w-4 h-4 mr-2" />
                    {isHebrew ? "חזרה לאתר" : "Return to Website"}
                  </Button>
                </Link>
                <Link href="/#questionnaires">
                  <Button data-testid="link-questionnaires-from-success">
                    <ClipboardList className="w-4 h-4 mr-2" />
                    {isHebrew ? "לשאלונים נוספים" : "More Questionnaires"}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default QuestionnairePage;
