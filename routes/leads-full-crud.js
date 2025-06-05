import express from "express";
import { neon } from "@neondatabase/serverless";
import { body, validationResult } from "express-validator";
import { sendMessageNotification, sendMessageAcknowledgment } from "../utils/mailer.js";

const router = express.Router();

// Create SQL instance with Neon, with fallback options
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('No database URL found in environment variables. Please check your .env file.');
}
const sql = neon(databaseUrl + '?sslmode=require');

// Log database connection status
console.log('Connected to Neon database for messages API');

// @route   POST /api/messages
// @desc    Save message data to Neon database (messages table)
// @access  Public
router.post(
  "/",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email")
      .optional()
      .isEmail()
      .withMessage("Valid email is required")
      .normalizeEmail(),
    body("phone")
      .trim()
      .notEmpty()
      .withMessage("Phone is required")
      .matches(/^0(5[^7]|[2-4]|[8-9]|7[0-9])[0-9]{7}$/)
      .withMessage("Invalid phone number"),
    body("subject")
      .optional()
      .isLength({ max: 255 })
      .withMessage("Subject must be 255 characters or less"),
    body("message").trim().notEmpty().withMessage("Message is required"),
  ],
  async (req, res) => {
    try {
      // Input Validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.error("Validation errors:", {
          errors: errors.array(),
          requestBody: req.body,
          timestamp: new Date().toISOString(),
        });
        return res.status(400).json({
          status: "error",
          message: "Validation failed",
          errors: errors.array().map(err => ({
            field: err.param,
            message: err.msg
          }))
        });
      }

      const { name, email, phone, subject, message } = req.body;

      // Input Sanitization
      const sanitizedData = {
        name: name.trim(),
        email: email ? email.trim().toLowerCase() : null,
        phone: phone.trim(),
        subject: subject ? subject.trim() : null,
        message: message.trim()
      };

      // Database Operation using Neon's tagged template literals
      let result;
      try {
        result = await sql`
          INSERT INTO messages (name, email, phone, subject, message, created_at) 
          VALUES (
            ${sanitizedData.name}, 
            ${sanitizedData.email}, 
            ${sanitizedData.phone}, 
            ${sanitizedData.subject}, 
            ${sanitizedData.message}, 
            CURRENT_TIMESTAMP
          ) 
          RETURNING id, name, email, phone, subject, message, created_at
        `;
        
        // Log for debugging
        console.log(`Successfully saved message with ID: ${result[0].id}`);

        // Send email notifications
        if (result && result[0]) {
          // Send notification to admin
          sendMessageNotification(result[0])
            .then(sent => {
              if (sent) {
                console.log(`Admin notification email sent for message ID: ${result[0].id}`);
              }
            })
            .catch(err => {
              console.error('Error sending admin notification:', err);
            });
          
          // Send acknowledgment to the message if they provided an email
          if (result[0].email) {
            sendMessageAcknowledgment(result[0])
              .then(sent => {
                if (sent) {
                  console.log(`Acknowledgment email sent to ${result[0].email}`);
                }
              })
              .catch(err => {
                console.error('Error sending acknowledgment email:', err);
              });
          }
        }
      } catch (dbError) {
        console.error("Database error during message insertion:", {
          error: dbError.stack || dbError.message,
          requestBody: sanitizedData,
          timestamp: new Date().toISOString(),
        });

        throw dbError; // Re-throw for general error handling
      }

      // Success Response
      console.log("Message saved successfully to Neon database:", {
        messageId: result?.[0]?.id
      });

      return res.status(201).json({
        status: "success",
        message: "Message saved successfully",
        data: {
          messageId: result?.[0]?.id
        }
      });

    } catch (error) {
      // Global Error Handler
      console.error("Unexpected error in message submission:", {
        error: error.stack || error.message,
        requestBody: req.body,
        timestamp: new Date().toISOString()
      });

      return res.status(500).json({
        status: "error",
        message: "An unexpected error occurred while processing your request",
        errorId: new Date().getTime()
      });
    }
  }
);

// @route   GET /api/messages
// @desc    Get all messages from Neon database (for administrative use)
// @access  Should be protected in production
router.get("/", async (req, res) => {
  try {
    // Get pagination parameters from query string
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filter = req.query.filter || "";
    
    console.log(`Fetching messages: page=${page}, limit=${limit}, filter=${filter}`);
    
    // Create filter condition if filter is provided
    let filterCondition = "";
    let filterParams = [];
    
    if (filter) {
      filterCondition = `WHERE name ILIKE $1 OR email ILIKE $1 OR phone ILIKE $1 OR subject ILIKE $1`;
      filterParams = [`%${filter}%`];
    }
    
    // Query to get total count
    let countQuery = `SELECT COUNT(*) FROM messages ${filterCondition}`;
    const countResult = await sql.unsafe(countQuery, filterParams);
    const total = parseInt(countResult[0]?.count || 0);
    
    // Calculate pagination details
    const offset = (page - 1) * limit;
    const totalPages = Math.ceil(total / limit);
    
    // Query to get messages for current page
    let messagesQuery = `
      SELECT * FROM messages ${filterCondition}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    
    const messages = await sql.unsafe(messagesQuery, filterParams);
    
    console.log(`Found ${messages.length} messages out of ${total} total`);
    
    // Format response to match frontend expectations
    return res.status(200).json({
      messages: messages,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error("Error retrieving messages:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to retrieve messages"
    });
  }
});

// @route   GET /api/messages/:id
// @desc    Get a single message by ID
// @access  Should be protected in production
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        status: "error",
        message: "Message ID is required"
      });
    }
    
    console.log(`Fetching message with ID: ${id}`);
    
    // Get the message
    const result = await sql`
      SELECT * FROM messages WHERE id = ${id}
    `;
    
    if (result.length === 0) {
      return res.status(404).json({
        status: "error",
        message: `Message with ID ${id} not found`
      });
    }
    
    return res.status(200).json({
      status: "success",
      data: result[0]
    });
  } catch (error) {
    console.error(`Error retrieving message ${req.params.id}:`, error);
    return res.status(500).json({
      status: "error",
      message: "Failed to retrieve message"
    });
  }
});

// @route   PUT /api/messages/:id
// @desc    Update a message by ID (including marking as read)
// @access  Should be protected in production
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { is_read, name, email, phone, subject, message } = req.body;
    
    if (!id) {
      return res.status(400).json({
        status: "error",
        message: "Message ID is required"
      });
    }
    
    console.log(`Updating message with ID: ${id}`);
    
    // Build dynamic update query based on provided fields
    let updateFields = [];
    let updateValues = [];
    
    if (is_read !== undefined) {
      updateFields.push('is_read');
      updateValues.push(is_read);
    }
    
    if (name) {
      updateFields.push('name');
      updateValues.push(name.trim());
    }
    
    if (email) {
      updateFields.push('email');
      updateValues.push(email.trim().toLowerCase());
    }
    
    if (phone) {
      updateFields.push('phone');
      updateValues.push(phone.trim());
    }
    
    if (subject) {
      updateFields.push('subject');
      updateValues.push(subject.trim());
    }
    
    if (message) {
      updateFields.push('message');
      updateValues.push(message.trim());
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "No update fields provided"
      });
    }
    
    // Create SQL SET clause for update
    const setClause = updateFields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    const query = `UPDATE messages SET ${setClause} WHERE id = $${updateFields.length + 1} RETURNING *`;
    
    // Add ID to values array
    updateValues.push(id);
    
    // Execute update
    const result = await sql.unsafe(query, updateValues);
    
    if (result.length === 0) {
      return res.status(404).json({
        status: "error",
        message: `Message with ID ${id} not found`
      });
    }
    
    console.log(`Successfully updated message with ID: ${id}`);
    
    return res.status(200).json({
      status: "success",
      message: "Message updated successfully",
      data: result[0]
    });
  } catch (error) {
    console.error(`Error updating message ${req.params.id}:`, error);
    return res.status(500).json({
      status: "error",
      message: "Failed to update message"
    });
  }
});

// @route   PUT /api/messages/:id/read
// @desc    Mark a message as read
// @access  Should be protected in production
router.put("/:id/read", async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        status: "error",
        message: "Message ID is required"
      });
    }
    
    console.log(`Marking message ${id} as read`);
    
    // Update the is_read field
    const result = await sql`
      UPDATE messages SET is_read = true WHERE id = ${id} RETURNING *
    `;
    
    if (result.length === 0) {
      return res.status(404).json({
        status: "error",
        message: `Message with ID ${id} not found`
      });
    }
    
    console.log(`Successfully marked message ${id} as read`);
    
    return res.status(200).json({
      status: "success",
      message: "Message marked as read",
      data: result[0]
    });
  } catch (error) {
    console.error(`Error marking message ${req.params.id} as read:`, error);
    return res.status(500).json({
      status: "error",
      message: "Failed to mark message as read"
    });
  }
});

// @route   DELETE /api/messages/:id
// @desc    Delete a message by ID
// @access  Should be protected in production
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        status: "error",
        message: "Message ID is required"
      });
    }
    
    console.log(`Attempting to delete message with ID: ${id}`);
    
    // Delete the message
    const result = await sql`
      DELETE FROM messages WHERE id = ${id} RETURNING id
    `;
    
    if (result.length === 0) {
      return res.status(404).json({
        status: "error",
        message: `Message with ID ${id} not found`
      });
    }
    
    console.log(`Successfully deleted message with ID: ${id}`);
    
    return res.status(200).json({
      status: "success",
      message: "Message deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting message:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to delete message"
    });
  }
});

// @route   GET /api/messages/unread-count
// @desc    Get count of unread messages
// @access  Should be protected in production
router.get("/unread-count", async (req, res) => {
  try {
    const result = await sql`
      SELECT COUNT(*) AS count FROM messages WHERE is_read = false
    `;
    
    const count = result?.[0]?.count || 0;
    console.log(`Found ${count} unread messages`);
    
    return res.status(200).json({
      status: "success",
      count: Number(count)
    });
  } catch (error) {
    console.error("Error getting unread message count:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to get unread message count"
    });
  }
});

export default router;
