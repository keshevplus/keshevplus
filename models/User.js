import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config();

// Function to get database URL from various sources
async function getDatabaseUrl() {
  // First try DATABASE_URL
  let databaseUrl = process.env.DATABASE_URL;
  
  // If still not found, try to read from database-connection.js if it exists
  if (!databaseUrl) {
    const connectionFile = path.join(__dirname, '../scripts/database-connection.js');
    if (fs.existsSync(connectionFile)) {
      try {
        const connection = await import('../scripts/database-connection.js');
        databaseUrl = connection.databaseUrl;
      } catch (error) {
        console.error('Error loading database connection file:', error.message);
      }
    }
  }
  
  // If still not found, try to construct from other environment variables
  if (!databaseUrl && process.env.KP_POSTGRES_HOST) {
    const host = process.env.KP_POSTGRES_HOST;
    const user = process.env.KP_POSTGRES_USER || 'postgres';
    const password = process.env.KP_POSTGRES_PASSWORD;
    const database = process.env.KP_POSTGRES_DATABASE || 'postgres';
    
    if (host && password) {
      databaseUrl = `postgres://${user}:${password}@${host}:5432/${database}?sslmode=require`;
    }
  }
  
  return databaseUrl;
}

// Create SQL instance with Neon - but handle missing connection gracefully
let sql;
try {
  const databaseUrl = await getDatabaseUrl();
  if (databaseUrl) {
    sql = neon(databaseUrl);
    console.log('Connected to Neon database successfully');
  } else {
    console.error('No database URL found. Database operations will fail.');
  }
} catch (error) {
  console.error('Error initializing database connection:', error.message);
}

class User {
  /**
   * Find a user by ID
   * @param {number} user_id - User ID
   * @returns {Promise<Object|null>} User object or null if not found
   */
static async findById(user_id) {
  try {
    if (!sql) {
        throw new Error('Database connection not initialized');
      }
      
      const result = await sql`
        SELECT id, username, email, role, created_at, last_login 
        FROM users WHERE id = ${user_id}
      `;
      return result[0] || null;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }

  /**
   * Find a user by email
   * @param {string} email - User email
   * @returns {Promise<Object|null>} User object or null if not found
   */
  static async findByEmail(email) {
    try {
      if (!sql) {
        throw new Error('Database connection not initialized');
      }
      
      const result = await sql`
        SELECT * FROM users WHERE email = ${email}
      `;
      return result[0] || null;
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  /**
   * Find a user by phone number
   * @param {string} phone - User phone number
   * @returns {Promise<Object|null>} User object or null if not found
   */
  static async findByPhone(phone) {
    try {
      if (!sql) {
        throw new Error('Database connection not initialized');
      }
      
      const result = await sql`
        SELECT * FROM users WHERE phone = ${phone}
      `;
      return result[0] || null;
    } catch (error) {
      console.error('Error finding user by phone:', error);
      throw error;
    }
  }

  /**
   * Find a user by email or phone, or create a new one from contact form data
   * @param {Object} userData - User data from contact form
   * @param {string} userData.name - User name
   * @param {string} userData.email - User email
   * @param {string} userData.phone - User phone number
   * @returns {Promise<Object>} User object with additional 'matchType' property if existing user
   */
  static async findOrCreateFromContact(userData) {
    try {
      if (!sql) {
        throw new Error('Database connection not initialized');
      }
      
      // Handle empty strings as NULL
      const email = userData.email && userData.email.trim() !== '' ? userData.email.trim() : null;
      const phone = userData.phone && userData.phone.trim() !== '' ? userData.phone.trim() : null;
      const name = userData.name && userData.name.trim() !== '' ? userData.name.trim() : 'Unknown';
      
      // First check if user exists by email
      let user = null;
      let matchType = null;
      
      if (email) {
        user = await this.findByEmail(email);
        if (user) matchType = 'email';
      }
      
      // If not found by email, check by phone
      if (!user && phone) {
        user = await this.findByPhone(phone);
        if (user) matchType = 'phone';
      }
      
      // If user exists, return it with the match type
      if (user) {
        console.log(`User already exists with ID: ${user.user_id} (matched by ${matchType})`);
        user.matchType = matchType; // Add match type to return object
        return user;
      }
      
      // Before creating, check that we're not about to create a duplicate
      try {
        // Double-check no user with this email exists
        if (email) {
          const emailCheck = await sql`SELECT COUNT(*) as count FROM users WHERE email = ${email}`;
          if (emailCheck[0].count > 0) {
            console.log(`Found existing user with email ${email} in final check`);
            const existingUser = await this.findByEmail(email);
            existingUser.matchType = 'email';
            return existingUser;
          }
        }
        
        // Double-check no user with this phone exists
        if (phone) {
          const phoneCheck = await sql`SELECT COUNT(*) as count FROM users WHERE phone = ${phone}`;
          if (phoneCheck[0].count > 0) {
            console.log(`Found existing user with phone ${phone} in final check`);
            const existingUser = await this.findByPhone(phone);
            existingUser.matchType = 'phone';
            return existingUser;
          }
        }
      } catch (checkError) {
        console.error('Error during duplicate check:', checkError);
        // Continue with creation attempt even if check fails
      }
      
      // Create new user without password, setting minimal fields
      // Use a try-catch block specifically for the INSERT to handle unique constraint violations
      try {
        const result = await sql`
          INSERT INTO users (
            username, 
            name, 
            email, 
            phone, 
            role, 
            created_at
          ) VALUES (
            ${email || phone || name},
            ${name},
            ${email},
            ${phone},
            'contact',
            CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Jerusalem'
          )
          RETURNING user_id, username, name, email, phone, role, created_at
        `;
        
        console.log(`New user created from contact form with ID: ${result[0].user_id}`);
        result[0].matchType = 'new'; // Add matchType to indicate this is a new user
        return result[0];
      } catch (insertError) {
        console.error('Error creating user, likely duplicate:', insertError);
        
        // If insert fails due to unique constraint, try to find the existing user
        if (insertError.message && (insertError.message.includes('unique constraint') || insertError.message.includes('duplicate key'))) {
          // Try to find by email again
          if (email) {
            const userByEmail = await this.findByEmail(email);
            if (userByEmail) {
              console.log(`Found user by email after constraint error: ${userByEmail.user_id}`);
              userByEmail.matchType = 'email-conflict';
              return userByEmail;
            }
          }
          
          // Try to find by phone again
          if (phone) {
            const userByPhone = await this.findByPhone(phone);
            if (userByPhone) {
              console.log(`Found user by phone after constraint error: ${userByPhone.user_id}`);
              userByPhone.matchType = 'phone-conflict';
              return userByPhone;
            }
          }
        }
        
        // If we still can't find an existing user, return null
        return null;
      }
    } catch (error) {
      console.error('Error finding or creating user from contact:', error);
      // Just log the error but don't throw, so contact form still works even if this fails
      return null;
    }
  }

  /**
   * Create a new user
   * @param {Object} userData - User data
   * @param {string} userData.username - Username
   * @param {string} userData.email - Email
   * @param {string} userData.password - Password (will be hashed)
   * @param {boolean} [userData.is_admin=false] - Is admin user
   * @returns {Promise<Object>} Created user object (without password)
   */
  static async create(userData) {
    try {
      if (!sql) {
        throw new Error('Database connection not initialized');
      }
      
      // Check if user exists
      const existingUser = await this.findByEmail(userData.email);
      if (existingUser) {
        throw new Error('User already exists');
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      const is_admin = userData.is_admin || false;

      // Insert user
      const result = await sql`
        INSERT INTO users (username, email, password_hash, is_admin) 
        VALUES (${userData.username}, ${userData.email}, ${hashedPassword}, ${is_admin}) 
        RETURNING user_id, username, email, is_admin, created_at, last_login
      `;

      return result[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Create an admin user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created admin user object
   */
  static async createAdmin(userData) {
    return this.create({
      ...userData,
      role: 'admin'
    });
  }

  /**
   * Authenticate a user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object|null>} User object if authenticated, null otherwise
   */
  static async authenticate(email, password) {
    const user = await this.findByEmail(email);
    if (user && user.password_hash) {
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (isMatch) {
        const { password_hash: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
      }
    }
    return null;
  }

  /**
   * Update a user
   * @param {number} user_id - User ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated user object
   */
  static async update(user_id, updateData) {
    try {
      if (!sql) {
        throw new Error('Database connection not initialized');
      }
      
      // If password is being updated, hash it
      if (updateData.password) {
        const salt = await bcrypt.genSalt(10);
        updateData.password_hash = await bcrypt.hash(updateData.password, salt);
        delete updateData.password;
      }

      // Build the update query dynamically
      let updateFields = [];
      let updateValues = [];
      
      Object.entries(updateData).forEach(([key, value]) => {
        if (key !== 'user_id') { // Skip the ID field
          updateFields.push(`${key} = ?`);
          updateValues.push(value);
        }
      });
      
      // Add the ID as the last parameter
      updateValues.push(user_id);
      
      const updateQuery = `
        UPDATE users 
        SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
        WHERE user_id = ? 
        RETURNING user_id, username, email, is_admin, created_at, last_login
      `;

      const result = await sql(updateQuery, updateValues);
      return result[0];
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Delete a user
   * @param {number} user_id - User ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  static async delete(user_id) {
    try {
      if (!sql) {
        throw new Error('Database connection not initialized');
      }
      
      const result = await sql`
        DELETE FROM users WHERE user_id = ${user_id} RETURNING user_id
      `;
      return result.length > 0;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  /**
   * Get all admins currently logged in
   * @returns {Promise<Object[]>} Array of logged in admin users
   */
  static async getLoggedInAdmins() {
    try {
      if (!sql) throw new Error('Database connection not initialized');
      const result = await sql`SELECT * FROM users WHERE role = 'admin' AND logged_in = true`;
      return result;
    } catch (error) {
      console.error('Error getting logged in admins:', error);
      throw error;
    }
  }

  /**
   * Set logged_in flag for a user by email
   * @param {string} email - User email
   * @param {boolean} value - New logged_in value
   */
  static async setLoggedIn(email, value) {
    try {
      if (!sql) throw new Error('Database connection not initialized');
      await sql`UPDATE users SET logged_in = ${value} WHERE email = ${email}`;
    } catch (error) {
      console.error('Error setting logged_in:', error);
      throw error;
    }
  }

  /**
   * Send password reset email
   * @param {string} email - User email
   * @param {string} resetUrl - Password reset URL
   */
  static async sendResetEmail(email, resetUrl) {
    // Use your EMAIL_API_KEY and email sending logic here
    const nodemailer = await import('nodemailer');
    const transporter = nodemailer.default.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_API_KEY,
      },
    });
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Admin Password Reset',
      html: `<p>Click <a href='${resetUrl}'>here</a> to reset your admin password. This link is valid for 1 hour.</p>`
    };
    await transporter.sendMail(mailOptions);
  }

  /**
   * Update password for a user by email
   * @param {string} email - User email
   * @param {string} newPassword - New password
   */
  static async updatePassword(email, newPassword) {
    try {
      if (!sql) throw new Error('Database connection not initialized');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      await sql`UPDATE users SET password_hash = ${hashedPassword} WHERE email = ${email}`;
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  }
}

export default User;
