const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

// POST /api/auth/register
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Please provide name, email, and password.' });
    }

    try {
        const [existing] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Email already in use.' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const [result] = await pool.query(
            'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
            [name, email, passwordHash]
        );

        const token = jwt.sign(
            { id: result.insertId, email, role: 'user' },
            process.env.JWT_SECRET || 'hackathon_secret_key',
            { expiresIn: '24h' }
        );

        res.status(201).json({
            token,
            user: { id: result.insertId, name, email, role: 'user' }
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error during registration.' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Please provide email and password.' });
    }

    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(400).json({ error: 'Invalid email or password.' });
        }

        const user = rows[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(400).json({ error: 'Invalid email or password.' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'hackathon_secret_key',
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error during login.' });
    }
});

module.exports = router;