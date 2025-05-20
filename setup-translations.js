// setup-translations.js - Initialize and populate the translations database tables

import { neon } from '@neondatabase/serverless';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function setupTranslations() {
  try {
    console.log('Setting up translation system...');
    
    // Get database URL
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.error('DATABASE_URL environment variable not found.');
      process.exit(1);
    }
    
    // Create SQL connection
    const sql = neon(databaseUrl);
    
    // Read and execute SQL schema file
    const schemaFilePath = path.resolve('./migrations/create-translations-tables.sql');
    console.log(`Reading schema file: ${schemaFilePath}`);
    const schemaSQL = await fs.readFile(schemaFilePath, 'utf8');
    
    // Execute schema SQL
    console.log('Creating translation tables in database...');
    await sql.unsafe(schemaSQL);
    console.log('Translation tables created successfully.');
    
    // Add initial translations - fetching namespaces and languages
    const namespaces = await sql`SELECT id, name FROM translation_namespaces`;
    const languages = await sql`SELECT id, code FROM languages`;
    
    // Map for easier lookup
    const namespaceMap = {};
    namespaces.forEach(ns => {
      namespaceMap[ns.name] = ns.id;
    });
    
    const languageMap = {};
    languages.forEach(lang => {
      languageMap[lang.code] = lang.id;
    });
    
    console.log('Adding initial translations...');
    
    // Common translations
    const commonTranslations = {
      'he': {
        'welcome': 'ברוכים הבאים לקשב פלוס',
        'loading': 'טוען...',
        'error': 'שגיאה',
        'success': 'בוצע בהצלחה!',
        'save': 'שמור',
        'cancel': 'ביטול',
        'close': 'סגור',
        'search': 'חיפוש',
        'language': 'שפה',
        'login': 'התחברות',
        'logout': 'התנתקות',
        'yes': 'כן',
        'no': 'לא',
        'back': 'חזרה'
      },
      'en': {
        'welcome': 'Welcome to Keshev Plus',
        'loading': 'Loading...',
        'error': 'Error',
        'success': 'Success!',
        'save': 'Save',
        'cancel': 'Cancel',
        'close': 'Close',
        'search': 'Search',
        'language': 'Language',
        'login': 'Log in',
        'logout': 'Log out',
        'yes': 'Yes',
        'no': 'No',
        'back': 'Back'
      }
    };
    
    // Admin translations (from the previous forms translation file)
    const adminTranslations = {
      'he': {
        'title': 'אזור ניהול',
        'email': 'כתובת אימייל',
        'password': 'סיסמה',
        'login': 'התחבר',
        'logging_in': 'מתחבר...',
        'authorized_only': 'הכניסה מורשית לאנשי הנהלה בלבד',
        'show_password': 'הצג סיסמה',
        'hide_password': 'הסתר סיסמה',
        'dashboard': 'לוח בקרה',
        'users': 'משתמשים',
        'settings': 'הגדרות',
        'welcome_admin': 'ברוך הבא, {name}',
        'last_login': 'התחברות אחרונה: {date}'
      },
      'en': {
        'title': 'Admin Area',
        'email': 'Email Address',
        'password': 'Password',
        'login': 'Log In',
        'logging_in': 'Logging in...',
        'authorized_only': 'Access restricted to administration only',
        'show_password': 'Show password',
        'hide_password': 'Hide password',
        'dashboard': 'Dashboard',
        'users': 'Users',
        'settings': 'Settings',
        'welcome_admin': 'Welcome, {name}',
        'last_login': 'Last login: {date}'
      }
    };
    
    // Insert common translations
    for (const [langCode, translations] of Object.entries(commonTranslations)) {
      const langId = languageMap[langCode];
      const namespaceId = namespaceMap['common'];
      
      for (const [key, translation] of Object.entries(translations)) {
        // Check if key exists
        let keyRecord = await sql`
          SELECT id FROM translation_keys 
          WHERE namespace_id = ${namespaceId} AND key = ${key}
        `;
        
        let keyId;
        if (keyRecord.length === 0) {
          // Create key if it doesn't exist
          const newKey = await sql`
            INSERT INTO translation_keys (namespace_id, key)
            VALUES (${namespaceId}, ${key})
            RETURNING id
          `;
          keyId = newKey[0].id;
        } else {
          keyId = keyRecord[0].id;
        }
        
        // Upsert translation
        await sql`
          INSERT INTO translations (key_id, language_id, translation)
          VALUES (${keyId}, ${langId}, ${translation})
          ON CONFLICT (key_id, language_id) 
          DO UPDATE SET translation = ${translation}, updated_at = CURRENT_TIMESTAMP
        `;
      }
    }
    
    // Insert admin translations
    for (const [langCode, translations] of Object.entries(adminTranslations)) {
      const langId = languageMap[langCode];
      const namespaceId = namespaceMap['admin'];
      
      for (const [key, translation] of Object.entries(translations)) {
        // Check if key exists
        let keyRecord = await sql`
          SELECT id FROM translation_keys 
          WHERE namespace_id = ${namespaceId} AND key = ${key}
        `;
        
        let keyId;
        if (keyRecord.length === 0) {
          // Create key if it doesn't exist
          const newKey = await sql`
            INSERT INTO translation_keys (namespace_id, key)
            VALUES (${namespaceId}, ${key})
            RETURNING id
          `;
          keyId = newKey[0].id;
        } else {
          keyId = keyRecord[0].id;
        }
        
        // Upsert translation
        await sql`
          INSERT INTO translations (key_id, language_id, translation)
          VALUES (${keyId}, ${langId}, ${translation})
          ON CONFLICT (key_id, language_id) 
          DO UPDATE SET translation = ${translation}, updated_at = CURRENT_TIMESTAMP
        `;
      }
    }
    
    console.log('Initial translations added successfully.');
    console.log('Translation system setup complete!');
  } catch (error) {
    console.error('Error setting up translations:', error);
  }
}

// Run the setup
setupTranslations();
