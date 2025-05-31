import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import User from './User.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config();

// Get database URL from environment
const databaseUrl = process.env.DATABASE_URL;
let sql;

try {
  if (databaseUrl) {
    sql = neon(databaseUrl);
    console.log('Connected to Neon database successfully for Lead model');
  } else {
    console.error('No database URL found for Lead model. Operations will fail.');
  }
} catch (error) {
  console.error('Error initializing Lead database connection:', error.message);
}

class Lead {
  /**
   * Find a lead by ID
   * @param {string} id - Lead ID
   * @returns {Promise<Object|null>} Lead object or null if not found
   */
  static async findById(id) {
    try {
      if (!sql) throw new Error('Database connection not initialized');
      
      const result = await sql`
        SELECT * FROM leads WHERE id = ${id}
      `;
      return result[0] || null;
    } catch (error) {
      console.error('Error finding lead by ID:', error);
      throw error;
    }
  }

  /**
   * Get all leads with pagination
   * @param {number} page - Page number (1-based)
   * @param {number} limit - Number of items per page
   * @param {string} filter - Optional filter string to search in name, email, subject
   * @returns {Promise<Object>} Object with leads array and pagination info
   */
  static async getAll(page = 1, limit = 100, filter = '') {
    try {
      if (!sql) throw new Error('Database connection not initialized');
      
      // Calculate offset
      const offset = (page - 1) * limit;
      
      // Build query based on filter
      let leads;
      let totalQuery;
      
      if (filter && filter.trim() !== '') {
        // Search with filter
        const searchPattern = `%${filter}%`;
        leads = await sql`
          SELECT * FROM leads 
          WHERE name ILIKE ${searchPattern} 
          OR email ILIKE ${searchPattern} 
          OR subject ILIKE ${searchPattern} 
          OR phone ILIKE ${searchPattern}
          ORDER BY created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `;
        
        totalQuery = await sql`
          SELECT COUNT(*) as total FROM leads 
          WHERE name ILIKE ${searchPattern} 
          OR email ILIKE ${searchPattern} 
          OR subject ILIKE ${searchPattern} 
          OR phone ILIKE ${searchPattern}
        `;
      } else {
        // Get all leads without filter
        leads = await sql`
          SELECT * FROM leads
          ORDER BY created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `;
        
        totalQuery = await sql`
          SELECT COUNT(*) as total FROM leads
        `;
      }
      
      // Get total count for pagination
      const total = parseInt(totalQuery[0]?.total || '0', 10);
      const totalPages = Math.ceil(total / limit);
      
      return {
        leads,
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      };
    } catch (error) {
      console.error('Error getting leads:', error);
      throw error;
    }
  }

  /**
   * Create a new lead and check if user exists
   * @param {Object} leadData - Lead data
   * @param {string} leadData.name - Name
   * @param {string} leadData.email - Email
   * @param {string} leadData.phone - Phone number
   * @param {string} leadData.subject - Subject
   * @param {string} leadData.message - Message content
   * @returns {Promise<Object>} Created lead with user info
   */
  static async create(leadData) {
    try {
      if (!sql) throw new Error('Database connection not initialized');
      
      // First check if user exists by email or phone
      let user = null;
      let userMatchType = null;
      let previousMessageCount = 0;
      
      if (leadData.email) {
        user = await User.findByEmail(leadData.email);
        if (user) userMatchType = 'email';
      }
      
      if (!user && leadData.phone) {
        user = await User.findByPhone(leadData.phone);
        if (user) userMatchType = 'phone';
      }
      
      // If user exists, count their previous messages
      if (user) {
        const previousMessagesQuery = await sql`
          SELECT COUNT(*) as count FROM leads 
          WHERE email = ${user.email} OR phone = ${user.phone}
        `;
        previousMessageCount = parseInt(previousMessagesQuery[0]?.count || '0', 10);
      }
      
      // Add current timestamp
      const now = new Date().toISOString();
      
      // Insert the lead
      const result = await sql`
        INSERT INTO leads (
          name, email, phone, subject, message, 
          created_at, is_read, 
          user_id, previous_message_count
        ) VALUES (
          ${leadData.name}, 
          ${leadData.email}, 
          ${leadData.phone}, 
          ${leadData.subject}, 
          ${leadData.message},
          ${now}, 
          ${now}, 
          false,
          ${user ? user.id : null},
          ${previousMessageCount}
        ) RETURNING *
      `;
      
      // Add user information to the response
      const newLead = result[0];
      if (newLead) {
        newLead.userInfo = user ? {
          id: user.id,
          matchType: userMatchType,
          previousMessageCount
        } : null;
      }
      
      return newLead;
    } catch (error) {
      console.error('Error creating lead:', error);
      throw error;
    }
  }

  /**
   * Mark a lead as read
   * @param {string} id - Lead ID
   * @returns {Promise<Object>} Updated lead
   */
  static async markAsRead(id) {
    try {
      if (!sql) throw new Error('Database connection not initialized');
      
      const result = await sql`
        UPDATE leads SET is_read = true 
        WHERE id = ${id} 
        RETURNING *
      `;
      return result[0] || null;
    } catch (error) {
      console.error('Error marking lead as read:', error);
      throw error;
    }
  }

  /**
   * Delete a lead
   * @param {string} id - Lead ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  static async delete(id) {
    try {
      if (!sql) throw new Error('Database connection not initialized');
      
      const result = await sql`
        DELETE FROM leads 
        WHERE id = ${id} 
        RETURNING id
      `;
      return result.length > 0;
    } catch (error) {
      console.error('Error deleting lead:', error);
      throw error;
    }
  }

  /**
   * Get count of unread leads
   * @returns {Promise<number>} Count of unread leads
   */
  static async getUnreadCount() {
    try {
      if (!sql) throw new Error('Database connection not initialized');
      
      const result = await sql`
        SELECT COUNT(*) as count 
        FROM leads 
        WHERE is_read = false
      `;
      return parseInt(result[0]?.count || '0', 10);
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  }
}

export default Lead;
