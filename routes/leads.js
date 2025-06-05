import express from "express";
import pool from "../services/database.js";
import { body, validationResult } from "express-validator";
import { sendMessageNotification, sendMessageAcknowledgment } from "../utils/mailer.js";

const router = express.Router();

// use the shared Pool instance; it already has the right connectionString and ssl settings
const client = pool;

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

      // Database Operation using PG Pool
      let result;
      try {
        const sql = `
          INSERT INTO messages (name, email, phone, subject, message, created_at) 
          VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP) 
          RETURNING id, name, email, phone, subject, message, created_at
        `;
        const params = [
          sanitizedData.name,
          sanitizedData.email,
          sanitizedData.phone,
          sanitizedData.subject,
          sanitizedData.message
        ];
        const queryResult = await client.query(sql, params);
        result = queryResult.rows;
        
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
    const countResult = await client.query(countQuery, filterParams);
    const total = parseInt(countResult.rows[0]?.count || 0);
    
    // Calculate pagination details
    const offset = (page - 1) * limit;
    const totalPages = Math.ceil(total / limit);
    
    // Query to get messages for current page
    let messagesQuery = `
      SELECT * FROM messages ${filterCondition}
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const messages = await client.query(messagesQuery, [...filterParams, limit, offset]);
    
    console.log(`Found ${messages.rows.length} messages out of ${total} total`);
    
    // Format response to match frontend expectations
    return res.status(200).json({
      messages: messages.rows,
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
    const sql = `DELETE FROM messages WHERE id = $1 RETURNING id`;
    const params = [id];
    const result = await client.query(sql, params);
    
    if (result.rows.length === 0) {
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

export default router;
