import express from 'express';
import cors from 'cors';
import apiRoutes from './routes/api';

const app = express();

// Enable CORS for your frontend
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? ['https://keshevplus.co.il', 'https://www.keshevplus.co.il']
        : 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON requests
app.use(express.json());

// Use API routes
app.use('/api', apiRoutes);

// Basic health check endpoint
app.get('/health', (req, res) => {
    res.status(200).send({ status: 'ok' });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export default app;
