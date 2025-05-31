import express from "express";
import { query } from "../config/db.js";
import { body, validationResult } from "express-validator";

const router = express.Router();

// @route   POST /api/messages
// @desc    Save contact form data to the messages table
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

      // Database Operation - Insert into messages table
      let result;
      try {
        result = await query(
          "INSERT INTO messages (name, email, phone, subject, message, created_at) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP) RETURNING id",
          [sanitizedData.name, sanitizedData.email, sanitizedData.phone, sanitizedData.subject, sanitizedData.message]
        );
      } catch (dbError) {
        console.error("Database error during message insertion:", {
          error: dbError.stack,
          requestBody: sanitizedData,
          timestamp: new Date().toISOString(),
          code: dbError.code
        });

        // Handle specific database errors
        if (dbError.code === '23505') { // Unique violation
          return res.status(409).json({
            status: "error",
            message: "This message already exists in our system"
          });
        }

        throw dbError; // Re-throw for general error handling
      }

      // Success Response
      console.log("Message saved successfully:", {
        messageId: result.rows[0].id
      });

      return res.status(201).json({
        status: "success",
        message: "Message saved successfully",
        data: {
          messageId: result.rows[0].id
        }
      });

    } catch (error) {
      // Global Error Handler
      console.error("Unexpected error in message submission:", {
        error: error.stack,
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
// @desc    Get all messages from messages table (for administrative use)
// @access  Should be protected in production
router.get("/", async (req, res) => {
  try {
    // Get pagination parameters from query string
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filter = req.query.filter || "";
    
    console.log(`Fetching messages: page=${page}, limit=${limit}, filter=${filter}`);
    
    // Count total messages with filter
    let countQuery = "SELECT COUNT(*) FROM messages";
    let queryParams = [];
    
    if (filter) {
      countQuery += " WHERE name ILIKE $1 OR email ILIKE $1 OR phone ILIKE $1 OR subject ILIKE $1";
      queryParams.push(`%${filter}%`);
    }
    
    const countResult = await query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].count);
    
    // Calculate pagination
    const offset = (page - 1) * limit;
    const totalPages = Math.ceil(total / limit);
    
    // Query to get messages for current page
    let messagesQuery = "SELECT * FROM messages";
    
    if (filter) {
      messagesQuery += " WHERE name ILIKE $1 OR email ILIKE $1 OR phone ILIKE $1 OR subject ILIKE $1";
    }
    
    messagesQuery += " ORDER BY created_at DESC LIMIT $" + (filter ? "2" : "1") + " OFFSET $" + (filter ? "3" : "2");
    
    if (filter) {
      queryParams.push(limit, offset);
    } else {
      queryParams.push(limit, offset);
    }
    
    const messagesResult = await query(messagesQuery, queryParams);
    
    // Format response to match frontend expectations
    return res.status(200).json({
      leads: messagesResult.rows,  // Using 'leads' key for frontend compatibility
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
    const result = await query(
      "DELETE FROM messages WHERE id = $1 RETURNING id",
      [id]
    );
    
    if (result.rowCount === 0) {
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
