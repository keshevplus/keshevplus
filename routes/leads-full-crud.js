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
console.log('Connected to Neon database for leads API');

// @route   POST /api/leads
// @desc    Save lead data to Neon database (leads table)
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
        
        // Log for debugging
        console.log(`Successfully saved lead with ID: ${result[0].id}`);

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

// @route   GET /api/leads/:id
// @desc    Get a single lead by ID
// @access  Should be protected in production
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        status: "error",
        message: "Lead ID is required"
      });
    }
    
    console.log(`Fetching lead with ID: ${id}`);
    
    // Get the lead
    const result = await sql`
      SELECT * FROM leads WHERE id = ${id}
    `;
    
    if (result.length === 0) {
      return res.status(404).json({
        status: "error",
        message: `Lead with ID ${id} not found`
      });
    }
    
    return res.status(200).json({
      status: "success",
      data: result[0]
    });
  } catch (error) {
    console.error(`Error retrieving lead ${req.params.id}:`, error);
    return res.status(500).json({
      status: "error",
      message: "Failed to retrieve lead"
    });
  }
});

// @route   PUT /api/leads/:id
// @desc    Update a lead by ID (including marking as read)
// @access  Should be protected in production
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { is_read, name, email, phone, subject, message } = req.body;
    
    if (!id) {
      return res.status(400).json({
        status: "error",
        message: "Lead ID is required"
      });
    }
    
    console.log(`Updating lead with ID: ${id}`);
    
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
    const query = `UPDATE leads SET ${setClause} WHERE id = $${updateFields.length + 1} RETURNING *`;
    
    // Add ID to values array
    updateValues.push(id);
    
    // Execute update
    const result = await sql.unsafe(query, updateValues);
    
    if (result.length === 0) {
      return res.status(404).json({
        status: "error",
        message: `Lead with ID ${id} not found`
      });
    }
    
    console.log(`Successfully updated lead with ID: ${id}`);
    
    return res.status(200).json({
      status: "success",
      message: "Lead updated successfully",
      data: result[0]
    });
  } catch (error) {
    console.error(`Error updating lead ${req.params.id}:`, error);
    return res.status(500).json({
      status: "error",
      message: "Failed to update lead"
    });
  }
});

// @route   PUT /api/leads/:id/read
// @desc    Mark a lead as read
// @access  Should be protected in production
router.put("/:id/read", async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        status: "error",
        message: "Lead ID is required"
      });
    }
    
    console.log(`Marking lead ${id} as read`);
    
    // Update the is_read field
    const result = await sql`
      UPDATE leads SET is_read = true WHERE id = ${id} RETURNING *
    `;
    
    if (result.length === 0) {
      return res.status(404).json({
        status: "error",
        message: `Lead with ID ${id} not found`
      });
    }
    
    console.log(`Successfully marked lead ${id} as read`);
    
    return res.status(200).json({
      status: "success",
      message: "Lead marked as read",
      data: result[0]
    });
  } catch (error) {
    console.error(`Error marking lead ${req.params.id} as read:`, error);
    return res.status(500).json({
      status: "error",
      message: "Failed to mark lead as read"
    });
  }
});

// @route   DELETE /api/leads/:id
// @desc    Delete a lead by ID
// @access  Should be protected in production
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        status: "error",
        message: "Lead ID is required"
      });
    }
    
    console.log(`Attempting to delete lead with ID: ${id}`);
    
    // Delete the lead
    const result = await sql`
      DELETE FROM leads WHERE id = ${id} RETURNING id
    `;
    
    if (result.length === 0) {
      return res.status(404).json({
        status: "error",
        message: `Lead with ID ${id} not found`
      });
    }
    
    console.log(`Successfully deleted lead with ID: ${id}`);
    
    return res.status(200).json({
      status: "success",
      message: "Lead deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting lead:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to delete lead"
    });
  }
});

// @route   GET /api/leads/unread-count
// @desc    Get count of unread leads
// @access  Should be protected in production
router.get("/unread-count", async (req, res) => {
  try {
    const result = await sql`
      SELECT COUNT(*) AS count FROM leads WHERE is_read = false
    `;
    
    const count = result?.[0]?.count || 0;
    console.log(`Found ${count} unread leads`);
    
    return res.status(200).json({
      status: "success",
      count: Number(count)
    });
  } catch (error) {
    console.error("Error getting unread lead count:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to get unread lead count"
    });
  }
});

export default router;
