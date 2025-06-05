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
    console.log('Connected to Neon database successfully for Message model');
  } else {
    console.error('No database URL found for Message model. Operations will fail.');
  }
} catch (error) {
  console.error('Error initializing Message database connection:', error.message);
}

class Message {
  /**
   * Find a message by ID
   * @param {string} id - Message ID
   * @returns {Promise<Object|null>} Message object or null if not found
   */
  static async findById(id) {
    try {
      if (!sql) throw new Error('Database connection not initialized');
      
      const result = await sql`
        SELECT * FROM messages WHERE id = ${id}
      `;
      return result[0] || null;
    } catch (error) {
      console.error('Error finding message by ID:', error);
      throw error;
    }
  }

  /**
   * Get all messages with pagination
   * @param {number} page - Page number (1-based)
   * @param {number} limit - Number of items per page
   * @param {string} filter - Optional filter string to search in name, email, subject
   * @returns {Promise<Object>} Object with messages array and pagination info
   */
  static async getAll(page = 1, limit = 100, filter = '') {
    try {
      if (!sql) throw new Error('Database connection not initialized');
      
      // Calculate offset
      const offset = (page - 1) * limit;
      
      // Build query based on filter
      let messages;
      let totalQuery;
      
      if (filter && filter.trim() !== '') {
        // Search with filter
        const searchPattern = `%${filter}%`;
        messages = await sql`
          SELECT * FROM messages 
          WHERE name ILIKE ${searchPattern} 
          OR email ILIKE ${searchPattern} 
          OR subject ILIKE ${searchPattern} 
          OR phone ILIKE ${searchPattern}
          ORDER BY created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `;
        
        totalQuery = await sql`
          SELECT COUNT(*) as total FROM messages 
          WHERE name ILIKE ${searchPattern} 
          OR email ILIKE ${searchPattern} 
          OR subject ILIKE ${searchPattern} 
          OR phone ILIKE ${searchPattern}
        `;
      } else {
        // Get all messages without filter
        messages = await sql`
          SELECT * FROM messages
          ORDER BY created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `;
        
        totalQuery = await sql`
          SELECT COUNT(*) as total FROM messages
        `;
      }
      
      // Get total count for pagination
      const total = parseInt(totalQuery[0]?.total || '0', 10);
      const totalPages = Math.ceil(total / limit);
      
      return {
        messages,
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
      console.error('Error getting messages:', error);
      throw error;
    }
  }

  /**
   * Create a new message and check if user exists
   * @param {Object} messageData - Message data
   * @param {string} messageData.name - Name
   * @param {string} messageData.email - Email
   * @param {string} messageData.phone - Phone number
   * @param {string} messageData.subject - Subject
   * @param {string} messageData.message - Message content
   * @returns {Promise<Object>} Created message with user info
   */
  static async create(messageData) {
    try {
      if (!sql) throw new Error('Database connection not initialized');
      
      // First check if user exists by email or phone
      let user = null;
      let userMatchType = null;
      let previousMessageCount = 0;
      
      if (messageData.email) {
        user = await User.findByEmail(messageData.email);
        if (user) userMatchType = 'email';
      }
      
      if (!user && messageData.phone) {
        user = await User.findByPhone(messageData.phone);
        if (user) userMatchType = 'phone';
      }
      
      // If user exists, count their previous messages
      if (user) {
        const previousMessagesQuery = await sql`
          SELECT COUNT(*) as count FROM messages 
          WHERE email = ${user.email} OR phone = ${user.phone}
        `;
        previousMessageCount = parseInt(previousMessagesQuery[0]?.count || '0', 10);
      }
      
      // Add current timestamp
      const now = new Date().toISOString();
      
      // Insert the message
      const result = await sql`
        INSERT INTO messages (
          name, email, phone, subject, message, 
          created_at, is_read, 
          user_id, previous_message_count
        ) VALUES (
          ${messageData.name}, 
          ${messageData.email}, 
          ${messageData.phone}, 
          ${messageData.subject}, 
          ${messageData.message},
          ${now}, 
          ${now}, 
          false,
          ${user ? user.id : null},
          ${previousMessageCount}
        ) RETURNING *
      `;
      
      // Add user information to the response
      const newMessage = result[0];
      if (newMessage) {
        newMessage.userInfo = user ? {
          id: user.id,
          matchType: userMatchType,
          previousMessageCount
        } : null;
      }
      
      return newMessage;
    } catch (error) {
      console.error('Error creating message:', error);
      throw error;
    }
  }

  /**
   * Mark a message as read
   * @param {string} id - Message ID
   * @returns {Promise<Object>} Updated message
   */
  static async markAsRead(id) {
    try {
      if (!sql) throw new Error('Database connection not initialized');
      
      const result = await sql`
        UPDATE messages SET is_read = true 
        WHERE id = ${id} 
        RETURNING *
      `;
      return result[0] || null;
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw error;
    }
  }

  /**
   * Delete a message
   * @param {string} id - Message ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  static async delete(id) {
    try {
      if (!sql) throw new Error('Database connection not initialized');
      
      const result = await sql`
        DELETE FROM messages 
        WHERE id = ${id} 
        RETURNING id
      `;
      return result.length > 0;
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }

  /**
   * Get count of unread messages
   * @returns {Promise<number>} Count of unread messages
   */
  static async getUnreadCount() {
    try {
      if (!sql) throw new Error('Database connection not initialized');
      
      const result = await sql`
        SELECT COUNT(*) as count 
        FROM messages 
        WHERE is_read = false
      `;
      return parseInt(result[0]?.count || '0', 10);
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  }
}

export default Message;
