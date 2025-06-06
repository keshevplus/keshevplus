import express from "express";
import { neon } from "@neondatabase/serverless";
import { body, validationResult } from "express-validator";
import { sendLeadNotification, sendLeadAcknowledgment } from "../utils/mailer.js";

const router = express.Router();

// Create SQL instance with Neon, with fallback options
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('No database URL found in environment variables. Please check your .env file.');
}
const sql = neon(databaseUrl + '?sslmode=require');

// Log database connection status
console.log('Connected to Neon database successfully');

// @route   POST /api/leads
// @desc    Save lead data to Neon database
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
          INSERT INTO leads (name, email, phone, subject, message, created_at) 
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
        
        // Also save to localStorage for easy retrieval
        // First get existing submissions
        let existingSubmissions = await sql`
          SELECT * FROM leads ORDER BY created_at DESC LIMIT 100
        `;
        
        // Log for debugging
        console.log(`Successfully saved submission with ID: ${result[0].id}`);        
        console.log(`Total submissions in database: ${existingSubmissions.length}`);

        // Send email notifications
        if (result && result[0]) {
          // Send notification to admin
          sendLeadNotification(result[0])
            .then(sent => {
              if (sent) {
                console.log(`Admin notification email sent for lead ID: ${result[0].id}`);
              }
            })
            .catch(err => {
              console.error('Error sending admin notification:', err);
            });
          
          // Send acknowledgment to the lead if they provided an email
          if (result[0].email) {
            sendLeadAcknowledgment(result[0])
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
        console.error("Database error during lead insertion:", {
          error: dbError.stack || dbError.message,
          requestBody: sanitizedData,
          timestamp: new Date().toISOString(),
        });

        throw dbError; // Re-throw for general error handling
      }

      // Success Response
      console.log("Lead saved successfully to Neon database:", {
        leadId: result?.[0]?.id
      });

      return res.status(201).json({
        status: "success",
        message: "Lead saved successfully",
        data: {
          leadId: result?.[0]?.id
        }
      });

    } catch (error) {
      // Global Error Handler
      console.error("Unexpected error in lead submission:", {
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

// @route   GET /api/leads
// @desc    Get all leads from Neon database (for administrative use)
// @access  Should be protected in production
router.get("/", async (req, res) => {
  try {
    // Get pagination parameters from query string
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filter = req.query.filter || "";
    
    console.log(`Fetching leads: page=${page}, limit=${limit}, filter=${filter}`);
    
    // Create filter condition if filter is provided
    let filterCondition = "";
    let filterParams = [];
    
    if (filter) {
      filterCondition = `WHERE name ILIKE $1 OR email ILIKE $1 OR phone ILIKE $1 OR subject ILIKE $1`;
      filterParams = [`%${filter}%`];
    }
    
    // Query to get total count
    let countQuery = `SELECT COUNT(*) FROM leads ${filterCondition}`;
    const countResult = await sql.unsafe(countQuery, filterParams);
    const total = parseInt(countResult[0]?.count || 0);
    
    // Calculate pagination details
    const offset = (page - 1) * limit;
    const totalPages = Math.ceil(total / limit);
    
    // Query to get leads for current page
    let leadsQuery = `
      SELECT * FROM leads ${filterCondition}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    
    const leads = await sql.unsafe(leadsQuery, filterParams);
    
    console.log(`Found ${leads.length} leads out of ${total} total`);
    
    // Format response to match frontend expectations
    return res.status(200).json({
      leads: leads,
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
    console.error("Error retrieving leads:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to retrieve leads"
    });
  }
});

export default router;
