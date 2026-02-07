export type QuestionnaireType = "parent" | "teacher" | "self_report";

export interface QuestionSection {
  id: string;
  titleHe: string;
  titleEn: string;
  questions: {
    id: string;
    he: string;
    en: string;
  }[];
}

export interface QuestionnaireConfig {
  type: QuestionnaireType;
  titleHe: string;
  titleEn: string;
  descriptionHe: string;
  descriptionEn: string;
  requiresChildInfo: boolean;
  sections: QuestionSection[];
}

export const RATING_OPTIONS = [
  { value: 0, he: "אף פעם", en: "Never" },
  { value: 1, he: "לפעמים", en: "Occasionally" },
  { value: 2, he: "לעתים קרובות", en: "Often" },
  { value: 3, he: "לעתים קרובות מאוד", en: "Very Often" },
];

export const PERFORMANCE_OPTIONS = [
  { value: 1, he: "מצוין", en: "Excellent" },
  { value: 2, he: "מעל הממוצע", en: "Above Average" },
  { value: 3, he: "ממוצע", en: "Average" },
  { value: 4, he: "בעייתי במקצת", en: "Somewhat of a Problem" },
  { value: 5, he: "בעייתי", en: "Problematic" },
];

export const parentQuestionnaire: QuestionnaireConfig = {
  type: "parent",
  titleHe: "שאלון ונדרבילט להורים",
  titleEn: "Vanderbilt Parent Rating Scale",
  descriptionHe: "שאלון להערכת תסמיני הפרעת קשב וריכוז (ADHD) בילדים, כפי שנצפים על ידי ההורים",
  descriptionEn: "Assessment of ADHD symptoms in children as observed by parents",
  requiresChildInfo: true,
  sections: [
    {
      id: "inattention",
      titleHe: "חוסר קשב",
      titleEn: "Inattention",
      questions: [
        { id: "p1", he: "לא מצליח/ה לשים לב לפרטים או עושה טעויות מרשלנות בלימודים", en: "Does not pay attention to details or makes careless mistakes with schoolwork" },
        { id: "p2", he: "מתקשה לשמור על קשב במשימות או בפעילויות משחק", en: "Has difficulty sustaining attention to tasks or activities" },
        { id: "p3", he: "נראה שאינו/ה מקשיב/ה כשמדברים אליו/ה ישירות", en: "Does not seem to listen when spoken to directly" },
        { id: "p4", he: "לא עוקב/ת אחר הוראות ולא מסיים/ה משימות או שיעורי בית", en: "Does not follow through on instructions and fails to finish schoolwork" },
        { id: "p5", he: "מתקשה לארגן משימות ופעילויות", en: "Has difficulty organizing tasks and activities" },
        { id: "p6", he: "נמנע/ת או לא אוהב/ת משימות שדורשות מאמץ מנטלי ממושך", en: "Avoids, dislikes, or is reluctant to engage in tasks that require sustained mental effort" },
        { id: "p7", he: "מאבד/ת דברים הנחוצים למשימות ופעילויות", en: "Loses things necessary for tasks or activities" },
        { id: "p8", he: "מוסח/ת בקלות על ידי גירויים חיצוניים", en: "Is easily distracted by extraneous stimuli" },
        { id: "p9", he: "שכחן/ית בפעילויות יומיומיות", en: "Is forgetful in daily activities" },
      ],
    },
    {
      id: "hyperactivity",
      titleHe: "היפראקטיביות / אימפולסיביות",
      titleEn: "Hyperactivity / Impulsivity",
      questions: [
        { id: "p10", he: "עושה תנועות חסרות מנוחה בידיים או ברגליים או מתפתל/ת בכיסא", en: "Fidgets with hands or feet or squirms in seat" },
        { id: "p11", he: "עוזב/ת את מקומו/ה בכיתה או במצבים שבהם נדרשת ישיבה", en: "Leaves seat in classroom or in other situations in which remaining seated is expected" },
        { id: "p12", he: "רץ/ה או מטפס/ת במצבים לא מתאימים", en: "Runs about or climbs excessively in situations in which it is inappropriate" },
        { id: "p13", he: "מתקשה לשחק או לעסוק בפעילויות פנאי בשקט", en: "Has difficulty playing or engaging in leisure activities quietly" },
        { id: "p14", he: 'תמיד "בתנועה" או פועל/ת כאילו "מונע/ת על ידי מנוע"', en: "Is \"on the go\" or acts as if \"driven by a motor\"" },
        { id: "p15", he: "מדבר/ת בצורה מוגזמת", en: "Talks excessively" },
        { id: "p16", he: "מפליט/ה תשובות לפני שהשאלות הושלמו", en: "Blurts out answers before questions have been completed" },
        { id: "p17", he: "מתקשה לחכות לתורו/ה", en: "Has difficulty waiting in line or awaiting turn" },
        { id: "p18", he: "מפריע/ה או חודר/ת לאחרים", en: "Interrupts or intrudes on others" },
      ],
    },
    {
      id: "odd",
      titleHe: "התנהגות מתריסה",
      titleEn: "Oppositional Defiant",
      questions: [
        { id: "p19", he: "מאבד/ת שליטה עצבית", en: "Loses temper" },
        { id: "p20", he: "מתווכח/ת עם מבוגרים", en: "Argues with adults" },
        { id: "p21", he: "מתנגד/ת באופן אקטיבי או מסרב/ת למלא בקשות או כללים", en: "Actively defies or refuses to comply with adults' requests or rules" },
        { id: "p22", he: "מרגיז/ה אנשים אחרים בכוונה", en: "Deliberately annoys people" },
        { id: "p23", he: "מאשים/ה אחרים בטעויות שלו/שלה", en: "Blames others for his or her mistakes or misbehavior" },
        { id: "p24", he: "רגיש/ה מדי או מתרגז/ת בקלות", en: "Is touchy or easily annoyed by others" },
        { id: "p25", he: "כועס/ת ומתמרמר/ת", en: "Is angry and resentful" },
        { id: "p26", he: "נוקמני/ת או נוטר/ת טינה", en: "Is spiteful or vindictive" },
      ],
    },
    {
      id: "performance",
      titleHe: "ביצועים",
      titleEn: "Performance",
      questions: [
        { id: "perf1", he: "ביצועים לימודיים כלליים", en: "Overall academic performance" },
        { id: "perf2", he: "קריאה", en: "Reading" },
        { id: "perf3", he: "כתיבה", en: "Writing" },
        { id: "perf4", he: "מתמטיקה", en: "Mathematics" },
        { id: "perf5", he: "יחסים עם הורים", en: "Relationship with parents" },
        { id: "perf6", he: "יחסים עם אחים/אחיות", en: "Relationship with siblings" },
        { id: "perf7", he: "יחסים עם חברים", en: "Relationship with peers" },
        { id: "perf8", he: "השתתפות בפעילויות מאורגנות", en: "Participation in organized activities" },
      ],
    },
  ],
};

export const teacherQuestionnaire: QuestionnaireConfig = {
  type: "teacher",
  titleHe: "שאלון ונדרבילט למורים",
  titleEn: "Vanderbilt Teacher Rating Scale",
  descriptionHe: "שאלון להערכת תסמיני ADHD כפי שנצפים על ידי המורה בסביבה הלימודית",
  descriptionEn: "Assessment of ADHD symptoms as observed by the teacher in the school environment",
  requiresChildInfo: true,
  sections: [
    {
      id: "inattention",
      titleHe: "חוסר קשב",
      titleEn: "Inattention",
      questions: [
        { id: "t1", he: "לא מצליח/ה לשים לב לפרטים או עושה טעויות מרשלנות בלימודים", en: "Fails to give attention to details or makes careless mistakes in schoolwork" },
        { id: "t2", he: "מתקשה לשמור על קשב במשימות או בפעילויות", en: "Has difficulty sustaining attention to tasks or activities" },
        { id: "t3", he: "נראה שאינו/ה מקשיב/ה כשמדברים אליו/ה ישירות", en: "Does not seem to listen when spoken to directly" },
        { id: "t4", he: "לא עוקב/ת אחר הוראות ולא מסיים/ה עבודה בכיתה", en: "Does not follow through on instructions and fails to finish schoolwork" },
        { id: "t5", he: "מתקשה לארגן משימות ופעילויות", en: "Has difficulty organizing tasks and activities" },
        { id: "t6", he: "נמנע/ת או לא אוהב/ת משימות שדורשות מאמץ מנטלי ממושך", en: "Avoids, dislikes, or is reluctant to engage in tasks requiring sustained mental effort" },
        { id: "t7", he: "מאבד/ת דברים הנחוצים למשימות ופעילויות", en: "Loses things necessary for tasks or activities" },
        { id: "t8", he: "מוסח/ת בקלות על ידי גירויים חיצוניים", en: "Is easily distracted by extraneous stimuli" },
        { id: "t9", he: "שכחן/ית בפעילויות יומיומיות", en: "Is forgetful in daily activities" },
      ],
    },
    {
      id: "hyperactivity",
      titleHe: "היפראקטיביות / אימפולסיביות",
      titleEn: "Hyperactivity / Impulsivity",
      questions: [
        { id: "t10", he: "עושה תנועות חסרות מנוחה בידיים או ברגליים או מתפתל/ת בכיסא", en: "Fidgets with hands or feet or squirms in seat" },
        { id: "t11", he: "עוזב/ת את מקומו/ה בכיתה כשנדרשת ישיבה", en: "Leaves seat in classroom or in other situations in which remaining seated is expected" },
        { id: "t12", he: "רץ/ה או מטפס/ת במצבים לא מתאימים", en: "Runs about or climbs excessively in inappropriate situations" },
        { id: "t13", he: "מתקשה לשחק או לעסוק בפעילויות בשקט", en: "Has difficulty playing or engaging in leisure activities quietly" },
        { id: "t14", he: 'תמיד "בתנועה" או פועל/ת כאילו "מונע/ת על ידי מנוע"', en: "Is \"on the go\" or acts as if \"driven by a motor\"" },
        { id: "t15", he: "מדבר/ת בצורה מוגזמת", en: "Talks excessively" },
        { id: "t16", he: "מפליט/ה תשובות לפני שהשאלות הושלמו", en: "Blurts out answers before questions have been completed" },
        { id: "t17", he: "מתקשה לחכות לתורו/ה", en: "Has difficulty waiting in line or awaiting turn" },
        { id: "t18", he: "מפריע/ה או חודר/ת לאחרים", en: "Interrupts or intrudes on others" },
      ],
    },
    {
      id: "odd",
      titleHe: "התנהגות מתריסה",
      titleEn: "Oppositional Defiant",
      questions: [
        { id: "t19", he: "מאבד/ת שליטה עצבית", en: "Loses temper" },
        { id: "t20", he: "מתווכח/ת עם מבוגרים", en: "Argues with adults" },
        { id: "t21", he: "מתנגד/ת באופן אקטיבי או מסרב/ת למלא כללים", en: "Actively defies or refuses to comply with rules" },
        { id: "t22", he: "מרגיז/ה אנשים אחרים בכוונה", en: "Deliberately annoys people" },
        { id: "t23", he: "מאשים/ה אחרים בטעויות שלו/שלה", en: "Blames others for his or her mistakes" },
        { id: "t24", he: "רגיש/ה מדי או מתרגז/ת בקלות", en: "Is touchy or easily annoyed by others" },
        { id: "t25", he: "כועס/ת ומתמרמר/ת", en: "Is angry and resentful" },
        { id: "t26", he: "נוקמני/ת", en: "Is spiteful or vindictive" },
      ],
    },
    {
      id: "performance",
      titleHe: "ביצועים בבית הספר",
      titleEn: "Academic Performance",
      questions: [
        { id: "tperf1", he: "ביצועים לימודיים כלליים", en: "Overall academic performance" },
        { id: "tperf2", he: "קריאה", en: "Reading" },
        { id: "tperf3", he: "כתיבה", en: "Writing" },
        { id: "tperf4", he: "מתמטיקה", en: "Mathematics" },
        { id: "tperf5", he: "יחסים עם בני גילו/ה", en: "Relationship with peers" },
        { id: "tperf6", he: "ציות להוראות", en: "Following directions" },
        { id: "tperf7", he: "הפרעה בכיתה", en: "Disrupting class" },
        { id: "tperf8", he: "השלמת מטלות", en: "Assignment completion" },
        { id: "tperf9", he: "כישורים ארגוניים", en: "Organizational skills" },
      ],
    },
  ],
};

export const selfReportQuestionnaire: QuestionnaireConfig = {
  type: "self_report",
  titleHe: "שאלון ונדרבילט - דיווח עצמי",
  titleEn: "Vanderbilt Self-Report Scale",
  descriptionHe: "שאלון הערכה עצמית לנוער (גיל 12+) ומבוגרים להערכת תסמיני הפרעת קשב וריכוז",
  descriptionEn: "Self-assessment for adolescents (12+) and adults to evaluate ADHD symptoms",
  requiresChildInfo: false,
  sections: [
    {
      id: "inattention",
      titleHe: "חוסר קשב",
      titleEn: "Inattention",
      questions: [
        { id: "s1", he: "אני מתקשה לשים לב לפרטים או עושה טעויות מרשלנות", en: "I have difficulty paying attention to details or make careless mistakes" },
        { id: "s2", he: "אני מתקשה לשמור על קשב במשימות", en: "I have difficulty sustaining attention to tasks" },
        { id: "s3", he: "נראה שאני לא מקשיב/ה כשמדברים אליי ישירות", en: "I don't seem to listen when spoken to directly" },
        { id: "s4", he: "אני לא עוקב/ת אחרי הוראות ולא מסיים/ה דברים", en: "I don't follow through on instructions and fail to finish things" },
        { id: "s5", he: "אני מתקשה להתארגן", en: "I have difficulty getting organized" },
        { id: "s6", he: "אני נמנע/ת ממשימות שדורשות מאמץ מנטלי ממושך", en: "I avoid tasks that require sustained mental effort" },
        { id: "s7", he: "אני מאבד/ת דברים שאני צריך/ה", en: "I lose things I need" },
        { id: "s8", he: "אני מוסח/ת בקלות", en: "I am easily distracted" },
        { id: "s9", he: "אני שכחן/ית בפעילויות יומיומיות", en: "I am forgetful in daily activities" },
      ],
    },
    {
      id: "hyperactivity",
      titleHe: "היפראקטיביות / אימפולסיביות",
      titleEn: "Hyperactivity / Impulsivity",
      questions: [
        { id: "s10", he: "אני עושה תנועות חסרות מנוחה בידיים או ברגליים", en: "I fidget with hands or feet or squirm in seat" },
        { id: "s11", he: "אני עוזב/ת את מקומי כשצריך לשבת", en: "I leave my seat when remaining seated is expected" },
        { id: "s12", he: "אני מרגיש/ה חוסר מנוחה", en: "I feel restless" },
        { id: "s13", he: "אני מתקשה לעסוק בפעילויות פנאי בשקט", en: "I have difficulty engaging in leisure activities quietly" },
        { id: "s14", he: 'אני תמיד "בתנועה"', en: "I am always \"on the go\"" },
        { id: "s15", he: "אני מדבר/ת יותר מדי", en: "I talk excessively" },
        { id: "s16", he: "אני עונה לפני שהשאלה מסתיימת", en: "I blurt out answers before questions are completed" },
        { id: "s17", he: "אני מתקשה לחכות לתור שלי", en: "I have difficulty waiting my turn" },
        { id: "s18", he: "אני מפריע/ה לאחרים", en: "I interrupt or intrude on others" },
      ],
    },
    {
      id: "daily_life",
      titleHe: "השפעה על חיי היומיום",
      titleEn: "Impact on Daily Life",
      questions: [
        { id: "s19", he: "הקשיים שלי משפיעים על הלימודים/העבודה", en: "My difficulties affect my studies/work" },
        { id: "s20", he: "הקשיים שלי משפיעים על יחסים חברתיים", en: "My difficulties affect my social relationships" },
        { id: "s21", he: "הקשיים שלי משפיעים על היחסים במשפחה", en: "My difficulties affect my family relationships" },
        { id: "s22", he: "אני מרגיש/ה מתוסכל/ת מהקשיים שלי", en: "I feel frustrated by my difficulties" },
        { id: "s23", he: "אני מתקשה לנהל את הזמן שלי", en: "I have difficulty managing my time" },
        { id: "s24", he: "אני מתקשה לסיים פרויקטים שהתחלתי", en: "I have difficulty finishing projects I start" },
      ],
    },
  ],
};

export const QUESTIONNAIRES: Record<QuestionnaireType, QuestionnaireConfig> = {
  parent: parentQuestionnaire,
  teacher: teacherQuestionnaire,
  self_report: selfReportQuestionnaire,
};

export function calculateScores(type: QuestionnaireType, answers: Record<string, number>): Record<string, number> {
  const config = QUESTIONNAIRES[type];
  const scores: Record<string, number> = {};
  let totalSymptomScore = 0;

  for (const section of config.sections) {
    let sectionScore = 0;
    let answeredCount = 0;
    for (const q of section.questions) {
      if (answers[q.id] !== undefined) {
        sectionScore += answers[q.id];
        answeredCount++;
      }
    }
    scores[section.id] = sectionScore;
    if (section.id !== "performance" && section.id !== "daily_life") {
      totalSymptomScore += sectionScore;
    }
  }

  scores.totalSymptoms = totalSymptomScore;
  return scores;
}
