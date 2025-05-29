import { Router } from 'express';
import { db } from '../db';
import { leads, users } from '../db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

const router = Router();

// Users endpoints
router.get('/users', async (req, res) => {
    try {
        const allUsers = await db.select({
            id: users.id,
            username: users.username,
            email: users.email,
            fullName: users.fullName,
            role: users.role,
            isAdmin: users.isAdmin
        }).from(users);

        res.json(allUsers);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Leads endpoints
router.post('/leads', async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;

        if (!name || !phone || !message) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const newLead = await db.insert(leads)
            .values({ name, email, phone, subject, message })
            .returning();

        res.status(201).json(newLead[0]);
    } catch (error) {
        console.error('Error creating lead:', error);
        res.status(500).json({ error: 'Failed to submit form' });
    }
});

// Add more API endpoints as needed

export default router;
