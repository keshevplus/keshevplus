// Run in the browser console while logged into https://dev.keshevplus.com/admin
// (paste the whole file into DevTools console and press Enter — this is a
// browser script, not a Node script, since it needs your admin session cookie).
// Inserts every "keshevweb.*" translation key that keshev-web's dev branch needs
// so its pages can be rendered entirely from t() calls instead of hardcoded text.
// NOTE: English values are AI-drafted placeholders for a working default — have a
// native/professional pass review them (especially the clinical/medical wording)
// before treating them as production-final copy.

const rows = [
  // nav
  ['keshevweb.nav.home', 'בית', 'Home'],
  ['keshevweb.nav.about', 'אודותינו', 'About Us'],
  ['keshevweb.nav.services', 'שירותינו', 'Our Services'],
  ['keshevweb.nav.adhd', 'מהי ADHD?', 'What is ADHD?'],
  ['keshevweb.nav.diagnosis', 'תהליך האבחון', 'Diagnosis Process'],
  ['keshevweb.nav.forms', 'שאלונים', 'Questionnaires'],
  ['keshevweb.nav.contact', 'יצירת קשר', 'Contact Us'],
  ['keshevweb.nav.menuTitle', 'תפריט', 'Menu'],
  ['keshevweb.nav.callUs', 'התקשרו:', 'Call us:'],
  ['keshevweb.nav.callNowAlt', 'התקשרו עכשיו', 'Call Now'],

  // footer
  ['keshevweb.footer.copyright', 'כל הזכויות שמורות לקשב פלוס', 'All rights reserved to Keshev Plus'],
  ['keshevweb.footer.credit', 'נבנה על ידי aloncode', 'Built by aloncode'],
  ['keshevweb.footer.navHeading', 'תפריט ניווט', 'Site Navigation'],
  ['keshevweb.footer.contactHeading', 'פרטי התקשרות', 'Contact Details'],
  ['keshevweb.footer.phoneLabel', 'טלפון:', 'Phone:'],
  ['keshevweb.footer.emailLabel', 'דוא"ל:', 'Email:'],
  ['keshevweb.footer.accessibilityLink', 'הצהרת נגישות', 'Accessibility Statement'],
  ['keshevweb.footer.privacyLink', 'מדיניות פרטיות', 'Privacy Policy'],
  ['keshevweb.footer.termsLink', 'תנאי שימוש', 'Terms of Use'],

  // shared contact info (canonical values, replaces 3 inconsistent hardcoded copies)
  ['keshevweb.contactInfo.address', 'יגאל אלון 94, מגדלי אלון 1, קומה 12, משרד 1202, תל אביב - יפו', '94 Yigal Alon St., Alon Towers 1, Floor 12, Suite 1202, Tel Aviv-Yafo'],
  ['keshevweb.contactInfo.phone', '055-27-399-27', '055-27-399-27'],
  ['keshevweb.contactInfo.email', 'dr@keshevplus.co.il', 'dr@keshevplus.co.il'],
  ['keshevweb.contactInfo.whatsapp', '972552739927', '972552739927'],

  // home
  ['keshevweb.home.title', 'ברוכים הבאים למרפאת "קשב פלוס"', 'Welcome to the "Keshev Plus" Clinic'],
  ['keshevweb.home.logoAlt', 'קשב פלוס', 'Keshev Plus'],
  ['keshevweb.home.intro.heading', 'ד"ר איירין כוכב רייפמן\nמומחית לאבחון וטיפול בהפרעות קשב וריכוז', 'Dr. Irene Kochav-Reifman\nSpecialist in ADHD Diagnosis and Treatment'],
  ['keshevweb.home.intro.text', 'בקשב פלוס, תקבלו אבחון מדויק ותוכנית טיפול אישית', "At Keshev Plus, you'll receive an accurate diagnosis and a personalized treatment plan"],
  ['keshevweb.home.hero.heading', 'הצעד הראשון מתחיל כאן', 'The first step starts here'],
  ['keshevweb.home.hero.text', 'קבעו פגישת ייעוץ - ובואו לגלות את הדרך להצלחה', 'Schedule a consultation and discover the path to success'],
  ['keshevweb.home.hero.imageAlt', 'רופא מקצועי', 'Medical professional'],
  ['keshevweb.home.contactCta.heading', 'התחל/י את האבחון עכשיו', 'Start Your Diagnosis Now'],
  ['keshevweb.home.aboutCta.heading', 'קרא/י עוד עלינו', 'Read More About Us'],
  ['keshevweb.home.list.items', '["בילדים","בנוער","במבוגרים"]', '["Children","Teens","Adults"]'],
  ['keshevweb.home.cta.heading', 'מוכנים להתחיל?', 'Ready to get started?'],
  ['keshevweb.home.cta.text', 'פנה/י אלינו היום כדי לקבוע את האבחון שלך ולקחת את הצעד הראשון לקראת חיים טובים יותר.', 'Reach out to us today to schedule your diagnosis and take the first step toward a better life.'],
  ['keshevweb.home.cta.button', 'צרו קשר עכשיו', 'Contact Us Now'],
  ['keshevweb.home.loading', 'טוען...', 'Loading...'],
  ['keshevweb.home.errorPrefix', 'שגיאה:', 'Error:'],
  ['keshevweb.home.reload', 'טען מחדש', 'Reload'],

  // about (About.tsx)
  ['keshevweb.about.title', 'אודותנו', 'About Us'],
  ['keshevweb.about.description', 'קשב פלוס, נעים להכיר', 'Keshev Plus — Nice to meet you'],
  ['keshevweb.about.doctorImageAlt', "דר' איירין כוכב-רייפמן", 'Dr. Irene Kochav-Reifman'],
  ['keshevweb.about.doctor.heading', "דר' איירין כוכב-רייפמן", 'Dr. Irene Kochav-Reifman'],
  ['keshevweb.about.doctor.text', 'רופאה מומחית בתחום האבחון והטיפול של הפרעות קשב וריכוז\n\nבעלת ניסיון עשיר באבחון של ילדים, מתבגרים ובוגרים\nבמהלך השנים ליוותה ד"ר כוכב-רייפמן מטופלים רבים במסע להגשמה אישית, תפקוד יומיומי מיטבי ושיפור איכות החיים', 'A physician specializing in the diagnosis and treatment of attention and concentration disorders.\n\nWith extensive experience diagnosing children, adolescents, and adults, Dr. Kochav-Reifman has guided many patients on their journey toward personal fulfillment, optimal daily functioning, and improved quality of life.'],

  // AboutSection (rich section embedded on Home)
  ['keshevweb.aboutSection.heading', 'אודותינו', 'About Us'],
  ['keshevweb.aboutSection.subheading', 'מומחים באבחון וטיפול בהפרעות קשב וריכוז', 'Experts in diagnosing and treating attention and concentration disorders'],
  ['keshevweb.aboutSection.doctorName', 'ד"ר איירין כוכב-רייפמן', 'Dr. Irene Kochav-Reifman'],
  ['keshevweb.aboutSection.doctorTitle', 'רופאה מומחית', 'Specialist Physician'],
  ['keshevweb.aboutSection.doctorBio', 'בעלת ניסיון עשיר באבחון של ילדים, מתבגרים ובוגרים. ליוותה מטופלים רבים במסע להגשמה אישית ותפקוד מיטבי.', 'Extensive experience diagnosing children, adolescents, and adults. Has guided many patients toward personal fulfillment and optimal functioning.'],
  ['keshevweb.aboutSection.imageAlt', 'ד"ר איירין כוכב-רייפמן', 'Dr. Irene Kochav-Reifman'],
  ['keshevweb.aboutSection.quote', 'המשימה שלנו היא לספק אבחון מדויק ותוכניות טיפול מותאמות אישית, המאפשרים למטופלים שלנו להגיע למיצוי הפוטנציאל האישי שלהם.', 'Our mission is to provide accurate diagnoses and personalized treatment plans that empower our patients to reach their full personal potential.'],
  ['keshevweb.aboutSection.credentials', '["מומחית באבחון וטיפול ב-ADHD","ניסיון של למעלה מ-15 שנה","התמחות בילדים, נוער ומבוגרים"]', '["Specialist in ADHD diagnosis and treatment","Over 15 years of experience","Specializing in children, teens, and adults"]'],
  ['keshevweb.aboutSection.values', '[{"title":"יחס אישי","desc":"כל מטופל מקבל יחס אישי ומותאם לצרכיו הייחודיים"},{"title":"מקצועיות","desc":"צוות מומחים עם ניסיון רב ועדכון מתמיד"},{"title":"דיסקרטיות","desc":"שמירה על פרטיות מלאה וסביבה בטוחה"}]', '[{"title":"Personal Care","desc":"Every patient receives personal attention tailored to their unique needs"},{"title":"Professionalism","desc":"A team of experts with extensive experience and ongoing training"},{"title":"Discretion","desc":"Full privacy and a safe environment"}]'],

  // services
  ['keshevweb.services.title', 'שירותינו במרפאה', 'Our Clinic Services'],
  ['keshevweb.services.heading', 'אנו מציעים מגוון רחב של שירותים מקצועיים בתחום אבחון וטיפול בהפרעות קשב', 'We offer a wide range of professional services in ADHD diagnosis and treatment'],
  ['keshevweb.services.items', JSON.stringify([
    { title: 'אבחון מקיף', description: 'הליך האבחון במרפאה מתבצע ביסודיות ומותאם באופן אישי לכל מטופל/ת\nאנו משתמשים בכלים מתקדמים ומקיפים, כולל שיחות מעמיקות ובדיקות מקצועיות, כדי לספק תובנות מדויקות על מצבו של המטופל' },
    { title: 'התאמת טיפול תרופתי אישי', description: 'על בסיס האבחון, אנו מתאימים תוכנית טיפול תרופתי ייחודית שמתאימה לצרכיו של כל מטופל\nהליווי שלנו כולל התאמות מתמשכות עד למציאת הטיפול האופטימלי, תוך שימת דגש על בטיחות ויעילות' },
    { title: 'מבחן ממוחשב MOXO', description: 'מבחן MOXO הוא מבחן ממוחשב להערכת תפקודי קשב, אשר נמצא בשימוש נרחב בישראל ובעולם\nהמבחן משמש ככלי תומך לאבחון, והוא מספק מידע אובייקטיבי להערכת תפקודי הקשב' },
    { title: 'ייעוץ ומעקב אחר מאובחנים', description: 'מטופלינו זוכים לליווי מקצועי מתמשך הכולל מעקב אחר התקדמות הטיפול, התאמות נדרשות והדרכה מקיפה' },
    { title: 'הפניות לטיפולים משלימים', description: 'במידת הצורך, אנו מפנים את המטופלים שלנו לטיפולים משלימים כגון ריפוי בעיסוק, טיפול רגשי או פסיכולוגי, וטיפולים נוספים שיכולים לתרום לשיפור איכות החיים' },
  ]), JSON.stringify([
    { title: 'Comprehensive Diagnosis', description: "Our clinic's diagnostic process is thorough and personalized for each patient. We use advanced, comprehensive tools, including in-depth interviews and professional assessments, to provide accurate insights into the patient's condition." },
    { title: 'Personalized Medication Management', description: "Based on the diagnosis, we tailor a unique medication plan suited to each patient's needs. Our ongoing support includes continuous adjustments until the optimal treatment is found, with an emphasis on safety and effectiveness." },
    { title: 'MOXO Computerized Test', description: 'The MOXO test is a computerized assessment of attention functions, widely used in Israel and around the world. It serves as a supporting diagnostic tool, providing objective information for evaluating attention functions.' },
    { title: 'Ongoing Consultation and Follow-up', description: 'Our patients receive continuous professional support, including progress monitoring, necessary adjustments, and comprehensive guidance.' },
    { title: 'Referrals for Complementary Treatments', description: 'When needed, we refer our patients to complementary treatments such as occupational therapy, emotional or psychological therapy, and other treatments that can improve quality of life.' },
  ])],

  // adhd
  ['keshevweb.adhd.title', 'מהי הפרעת קשב וריכוז?', 'What is ADHD?'],
  ['keshevweb.adhd.description', 'ADHD = Attention Deficit Hyperactivity Disorder', 'ADHD = Attention Deficit Hyperactivity Disorder'],
  ['keshevweb.adhd.overview.heading', 'מהי הפרעת קשב ופעלתנות יתר (ADHD)', 'What is Attention Deficit Hyperactivity Disorder (ADHD)'],
  ['keshevweb.adhd.overview.text', 'הפרעת קשב ופעלתנות יתר (ADHD) היא הפרעה נוירולוגית המשפיעה על יכולת הריכוז וההתנהגות. הפרעה זו נוטה להתבטא בקשיים בריכוז, קושי בהתארגנות, פעלתנות-יתר ולעיתים גם אימפולסיביות.', 'ADHD is a neurological disorder that affects concentration and behavior. It tends to manifest as difficulty concentrating, difficulty with organization, hyperactivity, and sometimes impulsivity.'],
  ['keshevweb.adhd.symptoms.heading', 'סימנים שכיחים', 'Common Signs'],
  ['keshevweb.adhd.symptoms.items', '["קשיי קשב וריכוז","היפראקטיביות","אימפולסיביות","קשיי התארגנות","דחיינות","שכחה"]', '["Attention and concentration difficulties","Hyperactivity","Impulsivity","Organizational difficulties","Procrastination","Forgetfulness"]'],
  ['keshevweb.adhd.treatment.heading', 'גישות טיפול', 'Treatment Approaches'],
  ['keshevweb.adhd.treatment.text', 'הטיפול בהפרעת קשב משלב בדרך כלל טיפול תרופתי, טיפול התנהגותי ואסטרטגיות למידה מותאמות אישית. הגישה הטיפולית המומלצת היא רב-מקצועית.', 'Treatment for ADHD typically combines medication, behavioral therapy, and personalized learning strategies. A multidisciplinary approach is recommended.'],
  ['keshevweb.adhd.treatment.cta', 'לקביעת פגישת אבחון', 'Schedule a Diagnostic Appointment'],

  // diagnosis
  ['keshevweb.diagnosis.title', 'תהליך האבחון והטיפול', 'The Diagnosis and Treatment Process'],
  ['keshevweb.diagnosis.description', 'תהליך אבחון הפרעת קשב מקצועי ואיכותי', 'A professional, high-quality ADHD diagnostic process'],
  ['keshevweb.diagnosis.firstMeeting.heading', 'שיחה ראשונית', 'Initial Conversation'],
  ['keshevweb.diagnosis.firstMeeting.text', 'מפגש אישי עם המטופל והמשפחה להבנת ההיסטוריה ההתפתחותית וההתנהגותית.', 'A personal meeting with the patient and family to understand developmental and behavioral history.'],
  ['keshevweb.diagnosis.questionnaires.heading', 'שאלונים מובנים', 'Structured Questionnaires'],
  ['keshevweb.diagnosis.questionnaires.text', 'איסוף מידע באמצעות שאלונים מתוקפים להורים, למורים ולמטופל.', 'Gathering information through validated questionnaires for parents, teachers, and the patient.'],
  ['keshevweb.diagnosis.testing.heading', 'בדיקות ממוחשבות', 'Computerized Testing'],
  ['keshevweb.diagnosis.testing.text', 'ביצוע מבחני קשב ממוחשבים להערכה אובייקטיבית של יכולות הקשב והריכוז.', 'Computerized attention tests for an objective assessment of attention and concentration abilities.'],
  ['keshevweb.diagnosis.diagnosis.heading', 'אבחנה וסיכום', 'Diagnosis and Summary'],
  ['keshevweb.diagnosis.diagnosis.text', 'פגישת סיכום והסברת האבחנה, כולל המלצות טיפוליות מותאמות אישית.', 'A summary meeting explaining the diagnosis, including personalized treatment recommendations.'],
  ['keshevweb.diagnosis.treatment.heading', 'תכנית טיפול', 'Treatment Plan'],
  ['keshevweb.diagnosis.treatment.text', 'בניית תכנית טיפול מקיפה הכוללת התערבות תרופתית, פסיכולוגית, חינוכית והתנהגותית לפי הצורך.', 'Building a comprehensive treatment plan that includes medical, psychological, educational, and behavioral intervention as needed.'],
  ['keshevweb.diagnosis.cta.heading', 'מעוניינים לקבוע פגישה?', 'Interested in Scheduling an Appointment?'],
  ['keshevweb.diagnosis.cta.text', 'צרו קשר עוד היום לקביעת פגישת אבחון מקיפה', 'Contact us today to schedule a comprehensive diagnostic appointment'],
  ['keshevweb.diagnosis.cta.button', 'צרו קשר עכשיו', 'Contact Us Now'],

  // forms
  ['keshevweb.forms.title', 'שאלונים', 'Questionnaires'],
  ['keshevweb.forms.description', 'שאלונים לזיהוי סימנים של הפרעת קשב וריכוז (ADHD)', 'Questionnaires to identify signs of ADHD'],
  ['keshevweb.forms.parents.heading', 'שאלון להורים', 'Parent Questionnaire'],
  ['keshevweb.forms.parents.text', 'שאלון זה מיועד להורים ומספק תובנות על התנהגות הילד בבית ובסביבה המשפחתית.', "This questionnaire is intended for parents and provides insight into the child's behavior at home and in the family environment."],
  ['keshevweb.forms.parents.cta', 'הורדת שאלון', 'Download Questionnaire'],
  ['keshevweb.forms.teachers.heading', 'שאלון למורים', 'Teacher Questionnaire'],
  ['keshevweb.forms.teachers.text', 'שאלון זה מיועד למורים ואנשי חינוך ומספק מידע על תפקוד הילד בסביבה הלימודית.', "This questionnaire is intended for teachers and educators and provides information about the child's functioning in the educational environment."],
  ['keshevweb.forms.teachers.cta', 'הורדת שאלון', 'Download Questionnaire'],
  ['keshevweb.forms.adults.heading', 'שאלון למבוגרים', 'Adult Questionnaire'],
  ['keshevweb.forms.adults.text', 'שאלון זה מיועד למבוגרים המעוניינים לבדוק אם יש להם סימנים המעידים על הפרעת קשב.', 'This questionnaire is intended for adults who want to check whether they have signs of ADHD.'],
  ['keshevweb.forms.adults.cta', 'הורדת שאלון', 'Download Questionnaire'],
  ['keshevweb.forms.instructions.heading', 'הנחיות למילוי השאלונים', 'Instructions for Completing the Questionnaires'],
  ['keshevweb.forms.instructions.text', 'אנא מלאו את השאלונים בכנות ובדייקנות רבה ככל האפשר.\nיש למלא את כל השאלות בשאלון.\nלאחר מילוי השאלון, ניתן להביאו לפגישת האבחון או לשלוח אותו מראש במייל.', 'Please fill out the questionnaires as honestly and accurately as possible.\nAll questions in the questionnaire must be answered.\nAfter completing the questionnaire, you can bring it to the diagnostic appointment or send it in advance by email.'],
  ['keshevweb.forms.cta.heading', 'צריכים עזרה?', 'Need Help?'],
  ['keshevweb.forms.cta.text', 'אם יש לכם שאלות לגבי מילוי השאלונים או אם אתם מתקשים בהורדה שלהם, צרו איתנו קשר', 'If you have questions about completing the questionnaires or have trouble downloading them, please contact us'],
  ['keshevweb.forms.cta.button', 'צרו קשר', 'Contact Us'],

  // contact
  ['keshevweb.contact.title', 'יצירת קשר', 'Contact Us'],
  ['keshevweb.contact.subheading', 'נשמח לענות על כל שאלה ולעזור לכם בכל נושא', "We're happy to answer any question and help you with anything"],
  ['keshevweb.contact.addressLabel', 'כתובת:', 'Address:'],
  ['keshevweb.contact.mapLink', 'פתח במפות גוגל', 'Open in Google Maps'],
  ['keshevweb.contact.form.nameLabel', 'שם', 'Name'],
  ['keshevweb.contact.form.emailLabel', 'אימייל', 'Email'],
  ['keshevweb.contact.form.phoneLabel', 'טלפון', 'Phone'],
  ['keshevweb.contact.form.subjectLabel', 'נושא', 'Subject'],
  ['keshevweb.contact.form.messageLabel', 'הודעה', 'Message'],
  ['keshevweb.contact.form.clearButton', 'נקה טופס', 'Clear Form'],
  ['keshevweb.contact.form.sendButton', 'שלח הודעה', 'Send Message'],
  ['keshevweb.contact.form.sending', 'שולח...', 'Sending...'],
  ['keshevweb.contact.toast.sending', 'שולח את הטופס...', 'Sending the form...'],
  ['keshevweb.contact.toast.success', 'הטופס נשלח בהצלחה!', 'The form was sent successfully!'],
  ['keshevweb.contact.toast.error', 'אירעה שגיאה בשליחת הטופס.', 'An error occurred while sending the form.'],
  ['keshevweb.contact.validation.nameMin', 'השם חייב להכיל לפחות 2 תווים', 'Name must contain at least 2 characters'],
  ['keshevweb.contact.validation.emailInvalid', 'אנא הכנס כתובת דוא"ל חוקית', 'Please enter a valid email address'],
  ['keshevweb.contact.validation.phoneInvalid', 'מספר טלפון לא תקין', 'Invalid phone number'],
  ['keshevweb.contact.validation.messageMin', 'ההודעה חייבת להכיל לפחות 2 תווים', 'Message must contain at least 2 characters'],

  // accessibility statement page (matches the real page JSX, not the barely-used data file)
  ['keshevweb.a11yStatement.title', 'הצהרת נגישות', 'Accessibility Statement'],
  ['keshevweb.a11yStatement.commitment.text', 'אנו ב-<strong>קשב פלוס</strong> מחויבים להנגשת האתר שלנו לכלל האוכלוסייה, כולל אנשים עם מוגבלויות. אנו רואים חשיבות רבה במתן שירות שוויוני לכלל המשתמשים, ולכן השקענו מאמצים רבים בהנגשת האתר בהתאם לתקנות שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות), התשע"ג-2013.', 'At <strong>Keshev Plus</strong>, we are committed to making our website accessible to the entire population, including people with disabilities. We place great importance on providing equal service to all users, and have invested significant effort in making the site accessible in accordance with the Equal Rights for Persons with Disabilities Regulations (Service Accessibility Adjustments), 2013.'],
  ['keshevweb.a11yStatement.adaptations.heading', 'התאמות נגישות שבוצעו באתר', 'Accessibility Adjustments Made to the Site'],
  ['keshevweb.a11yStatement.adaptations.items', JSON.stringify(['התאמת האתר לתצוגה במכשירים ניידים.', 'שימוש בניגודיות צבעים גבוהה לשיפור הקריאות.', 'אפשרות להגדלת טקסטים ולשינוי מרווחים בין שורות.', 'שימוש בתפריט נגישות המאפשר התאמות אישיות.', 'תמיכה בניווט באמצעות מקלדת.', 'שימוש בתיאורי טקסט לתמונות (alt).']), JSON.stringify(['Adapting the site for display on mobile devices.', 'Using high color contrast to improve readability.', 'The ability to enlarge text and change line spacing.', 'Using an accessibility menu that allows personal adjustments.', 'Keyboard navigation support.', 'Using descriptive alt text for images.'])],
  ['keshevweb.a11yStatement.menu.heading', 'תפריט נגישות', 'Accessibility Menu'],
  ['keshevweb.a11yStatement.menu.intro', 'באתר קיים תפריט נגישות המאפשר לבצע התאמות אישיות כגון:', 'The site has an accessibility menu that allows personal adjustments such as:'],
  ['keshevweb.a11yStatement.menu.items', JSON.stringify(['הגדלת והקטנת טקסטים.', 'שינוי מרווחים בין שורות וטקסטים.', 'שימוש במדריך קריאה.', 'הפיכת צבעים לגווני אפור.', 'ביטול אנימציות.']), JSON.stringify(['Increasing and decreasing text size.', 'Changing line and text spacing.', 'Using a reading guide.', 'Converting colors to grayscale.', 'Disabling animations.'])],
  ['keshevweb.a11yStatement.contact.heading', 'פנייה בנושא נגישות', 'Accessibility Inquiries'],
  ['keshevweb.a11yStatement.contact.intro', 'אם נתקלתם בבעיה כלשהי בנגישות האתר או אם יש לכם הצעות לשיפור, נשמח לשמוע מכם. ניתן לפנות אלינו בדרכים הבאות:', 'If you have encountered any accessibility issue on the site, or have suggestions for improvement, we would love to hear from you. You can contact us in the following ways:'],
  ['keshevweb.a11yStatement.contact.addressLabel', 'כתובת:', 'Address:'],
  ['keshevweb.a11yStatement.contact.phoneLabel', 'טלפון:', 'Phone:'],
  ['keshevweb.a11yStatement.contact.emailLabel', 'דוא"ל:', 'Email:'],
  ['keshevweb.a11yStatement.contact.whatsappLabel', 'וואטסאפ:', 'WhatsApp:'],
  ['keshevweb.a11yStatement.contact.whatsappLinkText', 'לחצו כאן לשליחת הודעה', 'Click here to send a message'],
  ['keshevweb.a11yStatement.lastUpdated.heading', 'תאריך עדכון אחרון', 'Last Updated'],
  ['keshevweb.a11yStatement.lastUpdated.prefix', 'הצהרת הנגישות עודכנה לאחרונה בתאריך:', 'This accessibility statement was last updated on:'],
  ['keshevweb.a11yStatement.lastUpdated.date', '3 ביוני 2025', 'June 3, 2025'],

  // accessibility widget
  ['keshevweb.a11yWidget.openMenuAria', 'פתח תפריט נגישות', 'Open accessibility menu'],
  ['keshevweb.a11yWidget.menuTitle', 'תפריט נגישות', 'Accessibility menu'],
  ['keshevweb.a11yWidget.resetButton', 'איפוס הגדרות', 'Reset Settings'],
  ['keshevweb.a11yWidget.resetAria', 'איפוס כל הגדרות הנגישות', 'Reset all accessibility settings'],
  ['keshevweb.a11yWidget.closeAria', 'סגור תפריט נגישות', 'Close accessibility menu'],
  ['keshevweb.a11yWidget.increaseText', 'הגדל טקסט', 'Increase Text'],
  ['keshevweb.a11yWidget.decreaseText', 'הקטן טקסט', 'Decrease Text'],
  ['keshevweb.a11yWidget.increaseSpacing', 'הגדל מרווח', 'Increase Spacing'],
  ['keshevweb.a11yWidget.decreaseSpacing', 'הקטן מרווח', 'Decrease Spacing'],
  ['keshevweb.a11yWidget.increaseLineHeight', 'הגדל גובה שורה', 'Increase Line Height'],
  ['keshevweb.a11yWidget.decreaseLineHeight', 'הקטן גובה שורה', 'Decrease Line Height'],
  ['keshevweb.a11yWidget.invertColors', 'הפוך צבעים', 'Invert Colors'],
  ['keshevweb.a11yWidget.grayHues', 'גווני אפור', 'Grayscale'],
  ['keshevweb.a11yWidget.linkHighlight', 'הדגשת קישורים', 'Link Highlighting'],
  ['keshevweb.a11yWidget.readableFont', 'גופן קריא', 'Readable Font'],
  ['keshevweb.a11yWidget.bigCursor', 'סמן גדול', 'Large Cursor'],
  ['keshevweb.a11yWidget.readingGuide', 'מדריך קריאה', 'Reading Guide'],
  ['keshevweb.a11yWidget.disableAnimations', 'בטל אנימציות', 'Disable Animations'],
  ['keshevweb.a11yWidget.statementLink', 'לצפיה בהצהרת הנגישות', 'View Accessibility Statement'],

  // 404
  ['keshevweb.notFound.heading', 'אופס! העמוד לא נמצא', 'Oops! Page Not Found'],
  ['keshevweb.notFound.text', 'נראה שהגעת לעמוד שלא קיים. אולי הקישור שבור או שהעמוד הוסר.', "It looks like you've reached a page that doesn't exist. The link may be broken or the page may have been removed."],
  ['keshevweb.notFound.button', 'חזרה לדף הבית', 'Back to Home'],

  // /spa secret route (page titles reuse keshevweb.nav.* keys)
  ['keshevweb.spa.prevPageAria', 'הדף הקודם', 'Previous page'],
  ['keshevweb.spa.nextPageAria', 'הדף הבא', 'Next page'],
  ['keshevweb.spa.goToPageAria', 'עבור לדף', 'Go to page'],
];

const translationItems = rows.flatMap(([key, he, en]) => [
  { key, language: 'he', value: he },
  { key, language: 'en', value: en },
]);

console.log(`Inserting ${translationItems.length} translation rows (${rows.length} keys x 2 languages)...`);

fetch('/api/translations/bulk', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify(translationItems),
})
  .then((res) => res.json().then((body) => ({ status: res.status, body })))
  .then(({ status, body }) => console.log('Done. Status:', status, body))
  .catch((err) => console.error('Failed:', err));
