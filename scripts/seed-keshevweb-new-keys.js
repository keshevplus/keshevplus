// Run in the browser console while logged into https://dev.keshevplus.com/admin
// (paste the whole file into DevTools console and press Enter).
// Seeds ONLY the keys that are new to keshev-web and don't already exist in
// keshevplus.com's production translations (DiagnosisSection has no
// production equivalent; contact validation/toast messages and the
// accessibility-statement page structure differ from production's own).
// Everything else keshev-web uses (nav.*, contact.*, hero.*, about.*,
// services.*, adhd.*, questionnaires.*, a11y.*, booking.*, appt_for.*,
// chat.*) already exists as real DB rows from keshevplus.com's own content
// and is already editable in the admin's Translations tab today.

const rows = [
  // Diagnosis section (keshev-web only, no production equivalent)
  ['diagnosis.title', 'תהליך האבחון והטיפול', 'The Diagnosis and Treatment Process'],
  ['diagnosis.subtitle', 'תהליך אבחון הפרעת קשב מקצועי ואיכותי', 'A professional, high-quality ADHD diagnostic process'],
  ['diagnosis.step1_title', 'שיחה ראשונית', 'Initial Conversation'],
  ['diagnosis.step1_desc', 'מפגש אישי עם המטופל והמשפחה להבנת ההיסטוריה ההתפתחותית וההתנהגותית.', 'A personal meeting with the patient and family to understand developmental and behavioral history.'],
  ['diagnosis.step2_title', 'שאלונים מובנים', 'Structured Questionnaires'],
  ['diagnosis.step2_desc', 'איסוף מידע באמצעות שאלונים מתוקפים להורים, למורים ולמטופל.', 'Gathering information through validated questionnaires for parents, teachers, and the patient.'],
  ['diagnosis.step3_title', 'בדיקות ממוחשבות', 'Computerized Testing'],
  ['diagnosis.step3_desc', 'ביצוע מבחני קשב ממוחשבים להערכה אובייקטיבית של יכולות הקשב והריכוז.', 'Computerized attention tests for an objective assessment of attention and concentration abilities.'],
  ['diagnosis.step4_title', 'אבחנה וסיכום', 'Diagnosis and Summary'],
  ['diagnosis.step4_desc', 'פגישת סיכום והסברת האבחנה, כולל המלצות טיפוליות מותאמות אישית.', 'A summary meeting explaining the diagnosis, including personalized treatment recommendations.'],
  ['diagnosis.step5_title', 'תכנית טיפול', 'Treatment Plan'],
  ['diagnosis.step5_desc', 'בניית תכנית טיפול מקיפה הכוללת התערבות תרופתית, פסיכולוגית, חינוכית והתנהגותית לפי הצורך.', 'Building a comprehensive treatment plan that includes medical, psychological, educational, and behavioral intervention as needed.'],
  ['diagnosis.cta_button', 'צרו קשר עכשיו', 'Contact Us Now'],

  // 404 page
  ['not_found.heading', 'אופס! העמוד לא נמצא', 'Oops! Page Not Found'],
  ['not_found.text', 'נראה שהגעת לעמוד שלא קיים. אולי הקישור שבור או שהעמוד הוסר.', "It looks like you've reached a page that doesn't exist. The link may be broken or the page may have been removed."],
  ['not_found.button', 'חזרה לדף הבית', 'Back to Home'],

  // /spa secret route aria-labels
  ['spa.go_to_page', 'עבור לדף', 'Go to page'],
  ['spa.prev_page', 'הדף הקודם', 'Previous page'],
  ['spa.next_page', 'הדף הבא', 'Next page'],

  // Contact form validation/toast messages (keshev-web's own zod form; no production equivalent)
  ['contact.validation_name_min', 'השם חייב להכיל לפחות 2 תווים', 'Name must contain at least 2 characters'],
  ['contact.validation_email_invalid', 'אנא הכנס כתובת דוא"ל חוקית', 'Please enter a valid email address'],
  ['contact.validation_phone_invalid', 'מספר טלפון לא תקין', 'Invalid phone number'],
  ['contact.validation_message_min', 'ההודעה חייבת להכיל לפחות 2 תווים', 'Message must contain at least 2 characters'],
  ['contact.toast_sending', 'שולח את הטופס...', 'Sending the form...'],
  ['contact.toast_error', 'אירעה שגיאה בשליחת הטופס.', 'An error occurred while sending the form.'],
  ['contact.toast_success', 'הטופס נשלח בהצלחה!', 'The form was sent successfully!'],

  // Accessibility statement page content (keshev-web's own structure/wording,
  // distinct from production's a11y_statement.* shape)
  ['a11y_statement.commitment_text', 'אנו ב-<strong>קשב פלוס</strong> מחויבים להנגשת האתר שלנו לכלל האוכלוסייה, כולל אנשים עם מוגבלויות. אנו רואים חשיבות רבה במתן שירות שוויוני לכלל המשתמשים, ולכן השקענו מאמצים רבים בהנגשת האתר בהתאם לתקנות שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות), התשע"ג-2013.', 'At <strong>Keshev Plus</strong>, we are committed to making our website accessible to the entire population, including people with disabilities. We place great importance on providing equal service to all users, and have invested significant effort in making the site accessible in accordance with the Equal Rights for Persons with Disabilities Regulations (Service Accessibility Adjustments), 2013.'],
  ['a11y_statement.adaptations_heading', 'התאמות נגישות שבוצעו באתר', 'Accessibility Adjustments Made to the Site'],
  ['a11y_statement.adaptations_items', JSON.stringify(['התאמת האתר לתצוגה במכשירים ניידים.', 'שימוש בניגודיות צבעים גבוהה לשיפור הקריאות.', 'אפשרות להגדלת טקסטים ולשינוי מרווחים בין שורות.', 'שימוש בתפריט נגישות המאפשר התאמות אישיות.', 'תמיכה בניווט באמצעות מקלדת.', 'שימוש בתיאורי טקסט לתמונות (alt).']), JSON.stringify(['Adapting the site for display on mobile devices.', 'Using high color contrast to improve readability.', 'The ability to enlarge text and change line spacing.', 'Using an accessibility menu that allows personal adjustments.', 'Keyboard navigation support.', 'Using descriptive alt text for images.'])],
  ['a11y_statement.menu_heading', 'תפריט נגישות', 'Accessibility Menu'],
  ['a11y_statement.menu_intro', 'באתר קיים תפריט נגישות המאפשר לבצע התאמות אישיות כגון:', 'The site has an accessibility menu that allows personal adjustments such as:'],
  ['a11y_statement.menu_items', JSON.stringify(['הגדלת והקטנת טקסטים.', 'שינוי מרווחים בין שורות וטקסטים.', 'שימוש במדריך קריאה.', 'הפיכת צבעים לגווני אפור.', 'ביטול אנימציות.']), JSON.stringify(['Increasing and decreasing text size.', 'Changing line and text spacing.', 'Using a reading guide.', 'Converting colors to grayscale.', 'Disabling animations.'])],
  ['a11y_statement.contact_heading', 'פנייה בנושא נגישות', 'Accessibility Inquiries'],
  ['a11y_statement.contact_intro', 'אם נתקלתם בבעיה כלשהי בנגישות האתר או אם יש לכם הצעות לשיפור, נשמח לשמוע מכם. ניתן לפנות אלינו בדרכים הבאות:', 'If you have encountered any accessibility issue on the site, or have suggestions for improvement, we would love to hear from you. You can contact us in the following ways:'],
  ['a11y_statement.whatsapp_label', 'וואטסאפ:', 'WhatsApp:'],
  ['a11y_statement.whatsapp_link_text', 'לחצו כאן לשליחת הודעה', 'Click here to send a message'],
  ['a11y_statement.last_updated_heading', 'תאריך עדכון אחרון', 'Last Updated'],
  ['a11y_statement.last_updated_prefix', 'הצהרת הנגישות עודכנה לאחרונה בתאריך:', 'This accessibility statement was last updated on:'],
  ['a11y_statement.last_updated_date', '3 ביוני 2025', 'June 3, 2025'],
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
