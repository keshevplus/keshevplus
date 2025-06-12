-- Seed initial page content for homepage and contact page

INSERT INTO page_content (page_key, locale, content_json) VALUES
('home','he', $$
{
  "title": "ברוכים הבאים לקשב פלוס",
  "subheading": "אבחון וטיפול מקצועי בהפרעות קשב וריכוז",
  "subTitle": "הצעד הראשון מתחיל כאן",
  "heroText": "קבעו פגישת ייעוץ - בואו לגלות את הדרך להצלחה",
  "list": ["ילדים", "מתבגרים", "מבוגרים"],
  "body": []
}
$$),
('contact','he', $$
{
  "id": "contact-page",
  "title": "יצירת קשר",
  "subtitle": "נשמח לענות על כל שאלה",
  "sections": [
    {
      "id": "contact-hero",
      "type": "hero",
      "title": "יצירת קשר",
      "subtitle": "אנחנו כאן כדי לעזור לכם",
      "content": "אנחנו כאן כדי לענות על כל שאלה ולעזור לכם בכל נושא.",
      "display_order": 1
    },
    {
      "id": "contact-form",
      "type": "form",
      "title": "שלחו לנו הודעה",
      "content": "מלאו את הטופס ונחזור אליכם בהקדם.",
      "display_order": 2
    },
    {
      "id": "contact-map",
      "type": "map",
      "title": "המיקום שלנו",
      "content": "",
      "display_order": 3
    }
  ],
  "contactInfo": {
    "address": "יגאל אלון 94 , מגדלי אלון 1, קומה 12, משרד 1202 תל אביב - יפו",
    "phone": "055-27-399-27",
    "email": "dr@keshevplus.co.il",
    "whatsapp": "972552739927",
    "location": { "lat": 32.0688715, "lng": 34.7939972, "zoom": 15 }
  },
  "formConfig": {
    "id": "contact-form",
    "title": "יצירת קשר",
    "fields": [
      { "id": "name", "name": "name", "label": "שם מלא", "type": "text", "placeholder": "הכנס/י שם מלא", "required": true },
      { "id": "email", "name": "email", "label": "דואר אלקטרוני", "type": "email", "placeholder": "דוא״ל שלך@דוגמה.com", "required": true },
      { "id": "phone", "name": "phone", "label": "טלפון", "type": "tel", "placeholder": "050-1234567", "required": true },
      { "id": "message", "name": "message", "label": "תוכן הפנייה", "type": "textarea", "placeholder": "הכנס/י את תוכן הפנייה כאן...", "required": true }
    ],
    "submitButtonText": "שלח פנייה",
    "successMessage": "ההודעה נשלחה בהצלחה! נחזור אליך בהקדם האפשרי",
    "errorMessage": "אירעה שגיאה בשליחת ההודעה. אנא נסה שנית או התקשר אלינו ישירות"
  }
}
$$),
('forms','he', $$
{
  "title": "שאלונים",
  "heading": "שאלונים לזיהוי סימנים של הפרעת קשב וריכוז (ADHD)",
  "body": [
    {
      "title": "שאלון להורים",
      "description": "שאלון זה מיועד להורים ומספק תובנות על התנהגות הילד בבית ובסביבה המשפחתית.",
      "image": "/assets/images/icon.png",
      "bgColor": "bg-orange-400/15 hover:bg-orange-400/40 text-right",
      "textColor": "text-black font-bold",
      "subtitle": "קבצים להורדה",
      "file": "/assets/forms/vanderbilt_parent_form"
    },
    {
      "title": "שאלון למורה",
      "description": "שאלון זה מיועד למורים ומספק תובנות על התנהגות הילד בכיתה ובסביבה החינוכית.",
      "image": "/assets/images/icon.png",
      "bgColor": "bg-orange-400/15 hover:bg-orange-400/40 text-right",
      "textColor": "text-black font-bold",
      "subtitle": "קבצים להורדה",
      "file": "/assets/forms/vanderbilt_teacher_form"
    },
    {
      "title": "שאלון דיווח עצמי",
      "description": "שאלון זה מיועד למילוי על ידי מבוגר מעל גיל 18 להערכת הפרעות קשב ופעלתנות יתר.",
      "image": "/assets/images/icon.png",
      "bgColor": "bg-orange-400/15 hover:bg-orange-400/40 text-right",
      "textColor": "text-black font-bold",
      "subtitle": "קבצים להורדה",
      "file": "/assets/forms/vanderbilt_self_form"
    }
  ]
}
$$),
('about','he', $$
{
  "title": "אודותנו",
  "heading": "קשב פלוס, נעים להכיר",
  "body": [
    {
      "title": "דר' איירין כוכב-רייפמן",
      "subtitle": "רופאה מומחית בתחום האבחון והטיפול של הפרעות קשב וריכוז",
      "description": "בעלת ניסיון עשיר באבחון של ילדים, מתבגרים ובוגרים במסגרת טיפולית מומחית לאורך השנים.",
      "image": "/assets/images/hero-about.jpeg",
      "bgColor": "#ffffff",
      "textColor": "#000000",
      "file": "/assets/files/sample.pdf"
    }
  ]
}
$$),
('services','he', $$
{
  "title": "שירותינו במרפאה",
  "heading": "אנו מציעים מגוון רחב של שירותים מקצועיים בתחום אבחון וטיפול בהפרעות קשב",
  "body": [
    {
      "title": "אבחון מקיף",
      "description": "הליך האבחון במרפאה מתבצע ביסודיות ומותאם באופן אישי לכל מטופל/ת.",
      "image": "/assets/images/icon.png",
      "bgColor": "bg-orange-400/15 hover:bg-orange-400/40 text-right",
      "textColor": "text-black font-bold"
    },
    {
      "title": "התאמת טיפול תרופתי אישי",
      "description": "על בסיס האבחון, אנו מתאימים תוכנית טיפול תרופתי ייחודית לכל מטופל/ת.",
      "image": "/assets/images/icon.png",
      "bgColor": "bg-orange-400/15 hover:bg-orange-400/40 text-right",
      "textColor": "text-black font-bold"
    }
  ],
  "additional": [
    {
      "title": "הדרכת צוותים חינוכיים",
      "description": "הדרכות וסדנאות לצוותים חינוכיים להתמודדות עם תלמידים עם הפרעות קשב.",
      "image": "/assets/images/icon.png"
    }
  ]
}
$$),
('adhd','he', $$
{
  "title": "מהי הפרעת קשב וריכוז ?",
  "heading": "ADHD = Attention Deficit Hyperactivity Disorder",
  "subheading": "הפרעת קשב ופעלתנות יתר (ADHD) היא הפרעה נוירולוגית המשפיעה על יכולת הריכוז וההתנהגות",
  "body": [
    {
      "title": "מהי הפרעת קשב ופעלתנות יתר (ADHD)",
      "description": "מצב נוירולוגי המשפיע על יכולת הריכוז, השליטה העצמית וההתנהגות.",
      "image": "/assets/images/icon.png",
      "bgColor": "bg-orange-400/15 hover:bg-orange-400/40 text-right",
      "textColor": "text-black font-bold"
    }
  ]
}
$$),
('diagnosis','he', $$
{
  "title": "תהליך האבחון והטיפול",
  "body": [
    {
      "title": "שיחה ראשונית",
      "description": "מפגש אישי להבנת ההיסטוריה ההתפתחותית וההתנהגותית.",
      "image": "/assets/images/icon.png",
      "bgColor": "bg-orange-400/15 hover:bg-orange-400/40 text-right",
      "textColor": "text-black font-bold"
    }
  ]
}
$$)
-- end additional seeds
ON CONFLICT (page_key, locale) DO UPDATE SET content_json = EXCLUDED.content_json;