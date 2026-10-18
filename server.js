const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Route Imports (adjust filenames if yours omit "Routes", e.g., './routes/auth')
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projectRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Global Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded project images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health Check
app.get('/', (req, res) => {
    res.json({ message: 'Hackathon Project Backend is running!' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/users', userRoutes);

// Handle unknown routes
app.use((req, res) => {
    res.status(404).json({ message: 'Endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);

    // Return 400 for file filter or Multer rejection errors
    if ((err.message && err.message.includes('Only image files')) || err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ error: err.message || 'File upload error' });
    }

    res.status(500).json({ message: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));