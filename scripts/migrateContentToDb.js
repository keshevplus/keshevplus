import dotenv from 'dotenv';
import { executeQuery, executeTransaction } from '../utils/db-utils.js';
import fs from 'fs';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load environment variables
dotenv.config();

// Import data files directly from local files
// You'll need to copy your data files from the client to the server
const loadDataFile = (filename) => {
  const filePath = path.join(__dirname, '..', 'data', filename);
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error loading data file ${filename}:`, error);
    return null;
  }
};

async function migrateContent() {
  try {
    console.log('Starting content migration...');
    
    // Load the data files
    const homePageData = loadDataFile('homePage.json');
    const servicesPageData = loadDataFile('servicesPage.json');
    const diagnosisPageData = loadDataFile('diagnosisPage.json');
    const adhdPageData = loadDataFile('adhdPage.json');
    const aboutPageData = loadDataFile('aboutPage.json');
    const contactPageData = loadDataFile('contactPage.json');
    
    // Load translation files
    const heNavigationData = loadDataFile('../locales/he/navigation.json');
    const heHomeData = loadDataFile('../locales/he/home.json');
    // ...other translation files
    
    // Insert data into database
    await executeTransaction(async (client) => {
      // Clear existing data if necessary
      await client.query('DELETE FROM page_content WHERE 1=1');
      
      // Insert home page content
      await client.query(`
        INSERT INTO page_content (page_key, content_json, locale)
        VALUES ($1, $2, $3)
      `, ['home', JSON.stringify(homePageData), 'he']);
      
      // Insert services page content
      await client.query(`
        INSERT INTO page_content (page_key, content_json, locale)
        VALUES ($1, $2, $3)
      `, ['services', JSON.stringify(servicesPageData), 'he']);
      
      // ...Insert other pages
      
      // Insert translations
      await client.query(`
        INSERT INTO translations (namespace, key, value, locale)
        VALUES ($1, $2, $3, $4)
      `, ['navigation', 'home', heNavigationData.home, 'he']);
      
      // ...Insert other translations
    });
    
    console.log('Content migration completed successfully');
  } catch (error) {
    console.error('Error migrating content:', error);
  }
}

// Execute the migration
migrateContent();
