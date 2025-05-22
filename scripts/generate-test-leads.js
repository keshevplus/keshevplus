import fetch from 'node-fetch';
import dotenv from 'dotenv';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Configuration
const API_URL = process.env.VITE_API_BASE_URL || 'https://api.keshevplus.co.il/api';
const CONTACT_ENDPOINT = `${API_URL}/contact`;
const SUBMISSION_INTERVAL = 60000; // 1 minute in milliseconds
const TOTAL_SUBMISSIONS = 10; // Total number of test leads to generate

// Hebrew subjects for the contact form
const subjects = [
  'שאלה כללית',
  'קביעת פגישת ייעוץ',
  'מידע על טיפולים',
  'תמחור',
  'שאלה על שיטות הטיפול',
  'בקשה להחלפת מועד',
  'התייעצות מקצועית',
  'מידע על סדנאות'
];

// Hebrew names
const firstNames = [
  'אבי', 'רחל', 'משה', 'שרה', 'דוד', 'חנה', 'יוסף', 'מרים',
  'יעקב', 'לאה', 'דניאל', 'רונית', 'אלון', 'תמר', 'אסף', 'מיכל'
];

const lastNames = [
  'כהן', 'לוי', 'גולדברג', 'פרידמן', 'אברהמי', 'רוזנברג', 'דויד',
  'מזרחי', 'אלוני', 'שפירא', 'גרינברג', 'ברקוביץ', 'פרץ', 'אדלר'
];

// Hebrew messages
const messageTemplates = [
  'אני מעוניין/ת לקבל מידע נוסף על השירותים שאתם מציעים לטיפול בהפרעות קשב וריכוז.',
  'אשמח לקבוע פגישת ייעוץ. מה הזמנים הפנויים בשבוע הבא?',
  'האם אתם מציעים טיפולים מקוונים? אני גר/ה רחוק ומתקשה להגיע פיזית.',
  'מהן עלויות האבחון והטיפול? האם אתם עובדים עם קופות חולים?',
  'אני מטפל/ת המתמחה בטיפול בילדים עם ADHD ואשמח להתייעץ עם אחד המומחים שלכם.',
  'האם ניתן לקבל ייעוץ חד פעמי בנושא הפרעות קשב אצל מבוגרים?',
  'מהם הטיפולים הכי אפקטיביים עבור מתבגרים עם קשיי קשב?',
  'אני מנהל/ת בית ספר ומעוניין/ת לדעת אם אתם מספקים סדנאות למורים.'
];

// Generate random data
function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateRandomPhone() {
  const prefixes = ['050', '052', '053', '054', '055', '058'];
  const prefix = getRandomItem(prefixes);
  const number = Math.floor(1000000 + Math.random() * 9000000);
  return `${prefix}-${number}`;
}

function generateRandomEmail(firstName, lastName) {
  const domains = ['gmail.com', 'outlook.co.il', 'yahoo.com', 'walla.co.il', 'hotmail.com'];
  const normalizedFirst = firstName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const normalizedLast = lastName.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  // Randomly choose email format
  const format = Math.floor(Math.random() * 3);
  let email;
  
  switch(format) {
    case 0:
      email = `${normalizedFirst}${normalizedLast}`;
      break;
    case 1:
      email = `${normalizedFirst}.${normalizedLast}`;
      break;
    case 2:
      email = `${normalizedFirst}${Math.floor(Math.random() * 100)}`;
      break;
  }
  
  return `${email}@${getRandomItem(domains)}`;
}

function generateContactData() {
  const firstName = getRandomItem(firstNames);
  const lastName = getRandomItem(lastNames);
  
  return {
    name: `${firstName} ${lastName}`,
    email: generateRandomEmail(firstName, lastName),
    phone: generateRandomPhone(),
    subject: getRandomItem(subjects),
    message: getRandomItem(messageTemplates),
    source: 'mock' // Mark these submissions as mock data
  };
}

// Submit the form data
async function submitContactForm(data) {
  try {
    console.log(`Submitting form for ${data.name}...`);
    
    const response = await fetch(CONTACT_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log(`✅ Success! Form submitted for ${data.name}`);
      console.log('Response:', result);
    } else {
      console.error(`❌ Error submitting form for ${data.name}:`, result);
    }
    
    return response.ok;
  } catch (error) {
    console.error(`❌ Exception submitting form for ${data.name}:`, error);
    return false;
  }
}

// Main function to run the test
async function runContactFormTest() {
  console.log(`Starting automated contact form test - will submit ${TOTAL_SUBMISSIONS} forms, one per minute`);
  console.log(`Using API endpoint: ${CONTACT_ENDPOINT}`);
  
  let successCount = 0;
  let failureCount = 0;
  let submissionCount = 0;
  
  const intervalId = setInterval(async () => {
    if (submissionCount >= TOTAL_SUBMISSIONS) {
      clearInterval(intervalId);
      console.log('\nTest completed!');
      console.log(`✅ Successful submissions: ${successCount}`);
      console.log(`❌ Failed submissions: ${failureCount}`);
      process.exit(0);
      return;
    }
    
    const contactData = generateContactData();
    submissionCount++;
    
    console.log(`\n[${submissionCount}/${TOTAL_SUBMISSIONS}] Submitting contact form...`);
    console.log(contactData);
    
    const success = await submitContactForm(contactData);
    
    if (success) {
      successCount++;
    } else {
      failureCount++;
    }
    
    console.log(`Progress: ${submissionCount}/${TOTAL_SUBMISSIONS} completed`);
  }, SUBMISSION_INTERVAL);
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    clearInterval(intervalId);
    console.log('\nTest interrupted!');
    console.log(`✅ Successful submissions: ${successCount}`);
    console.log(`❌ Failed submissions: ${failureCount}`);
    process.exit(0);
  });
}

// Run the test
runContactFormTest();
