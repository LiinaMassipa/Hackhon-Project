const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');

const authRoutes = require('../routes/auth');
const projectRoutes = require('../routes/projectRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
    res.json({ message: 'Hackathon Project Backend is running!' });
});

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);

app.use((req, res) => {
    res.status(404).json({ message: 'Endpoint not found' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);

    if (err.message.includes('Only image files') || err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ error: err.message });
    }

    res.status(500).json({ message: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
