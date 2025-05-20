// routes/translations.js - API routes for handling translations

import express from 'express';
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const sql = neon(process.env.DATABASE_URL);

// Get all available languages
router.get('/languages', async (req, res) => {
  try {
    const languages = await sql`
      SELECT id, code, name, native_name, rtl, is_default 
      FROM languages WHERE is_active = true
      ORDER BY CASE WHEN is_default THEN 0 ELSE 1 END, name
    `;
    res.json(languages);
  } catch (error) {
    console.error('Error fetching languages:', error);
    res.status(500).json({ message: 'Failed to fetch languages', error: error.message });
  }
});

// Get all translations for a specific language and namespace
router.get('/resources/:language/:namespace', async (req, res) => {
  try {
    const { language, namespace } = req.params;
    
    // Fetch language ID
    const langResult = await sql`
      SELECT id FROM languages WHERE code = ${language} AND is_active = true
    `;
    
    if (langResult.length === 0) {
      return res.status(404).json({ message: `Language '${language}' not found` });
    }
    
    const languageId = langResult[0].id;
    
    // Fetch namespace ID
    const nsResult = await sql`
      SELECT id FROM translation_namespaces WHERE name = ${namespace}
    `;
    
    if (nsResult.length === 0) {
      return res.status(404).json({ message: `Namespace '${namespace}' not found` });
    }
    
    const namespaceId = nsResult[0].id;
    
    // Fetch translations
    const translations = await sql`
      SELECT tk.key, t.translation 
      FROM translations t
      JOIN translation_keys tk ON t.key_id = tk.id
      WHERE t.language_id = ${languageId}
      AND tk.namespace_id = ${namespaceId}
    `;
    
    // Format as key-value object
    const result = {};
    translations.forEach(item => {
      result[item.key] = item.translation;
    });
    
    res.json(result);
  } catch (error) {
    console.error(`Error fetching translations:`, error);
    res.status(500).json({ message: 'Failed to fetch translations', error: error.message });
  }
});

// Update or create a translation
router.post('/update', async (req, res) => {
  try {
    const { languageCode, namespace, key, translation } = req.body;
    
    if (!languageCode || !namespace || !key || translation === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Get language ID
    const langResult = await sql`
      SELECT id FROM languages WHERE code = ${languageCode}
    `;
    
    if (langResult.length === 0) {
      return res.status(404).json({ message: `Language '${languageCode}' not found` });
    }
    
    const languageId = langResult[0].id;
    
    // Get namespace ID
    const nsResult = await sql`
      SELECT id FROM translation_namespaces WHERE name = ${namespace}
    `;
    
    if (nsResult.length === 0) {
      return res.status(404).json({ message: `Namespace '${namespace}' not found` });
    }
    
    const namespaceId = nsResult[0].id;
    
    // Check if key exists
    let keyResult = await sql`
      SELECT id FROM translation_keys WHERE namespace_id = ${namespaceId} AND key = ${key}
    `;
    
    let keyId;
    if (keyResult.length === 0) {
      // Create key
      const newKeyResult = await sql`
        INSERT INTO translation_keys (namespace_id, key)
        VALUES (${namespaceId}, ${key})
        RETURNING id
      `;
      keyId = newKeyResult[0].id;
    } else {
      keyId = keyResult[0].id;
    }
    
    // Upsert translation
    await sql`
      INSERT INTO translations (key_id, language_id, translation)
      VALUES (${keyId}, ${languageId}, ${translation})
      ON CONFLICT (key_id, language_id) 
      DO UPDATE SET translation = ${translation}, updated_at = CURRENT_TIMESTAMP
    `;
    
    res.json({ success: true, message: 'Translation updated successfully' });
  } catch (error) {
    console.error('Error updating translation:', error);
    res.status(500).json({ message: 'Failed to update translation', error: error.message });
  }
});

// Get all translations for multiple namespaces (bulk fetch)
router.get('/resources/:language', async (req, res) => {
  try {
    const { language } = req.params;
    const { namespaces } = req.query;
    
    // Parse namespaces from query param
    const namespaceList = namespaces ? namespaces.split(',') : [];
    
    if (namespaceList.length === 0) {
      return res.status(400).json({ message: 'At least one namespace is required' });
    }
    
    // Fetch language ID
    const langResult = await sql`
      SELECT id FROM languages WHERE code = ${language} AND is_active = true
    `;
    
    if (langResult.length === 0) {
      return res.status(404).json({ message: `Language '${language}' not found` });
    }
    
    const languageId = langResult[0].id;
    
    // Fetch namespace IDs
    const nsResult = await sql`
      SELECT id, name FROM translation_namespaces 
      WHERE name = ANY(${namespaceList})
    `;
    
    if (nsResult.length === 0) {
      return res.status(404).json({ message: `No matching namespaces found` });
    }
    
    const namespaceIds = nsResult.map(ns => ns.id);
    const namespaceMap = {};
    nsResult.forEach(ns => {
      namespaceMap[ns.id] = ns.name;
    });
    
    // Fetch translations for all requested namespaces
    const translations = await sql`
      SELECT tk.key, tk.namespace_id, t.translation 
      FROM translations t
      JOIN translation_keys tk ON t.key_id = tk.id
      WHERE t.language_id = ${languageId}
      AND tk.namespace_id = ANY(${namespaceIds})
    `;
    
    // Format as namespace-based object
    const result = {};
    
    // Initialize empty objects for each namespace
    namespaceList.forEach(ns => {
      result[ns] = {};
    });
    
    // Fill in translations
    translations.forEach(item => {
      const namespaceName = namespaceMap[item.namespace_id];
      if (namespaceName) {
        result[namespaceName][item.key] = item.translation;
      }
    });
    
    res.json(result);
  } catch (error) {
    console.error(`Error fetching translations:`, error);
    res.status(500).json({ message: 'Failed to fetch translations', error: error.message });
  }
});

export default router;
