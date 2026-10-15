const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const verifyToken = require('../middleware/auth');

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

// GET /api/auth/me — current user's profile
router.get('/me', verifyToken, async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT id, name, email, role FROM users WHERE id = ?',
            [req.user.id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }
        res.json({ user: rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Server error loading profile.' });
    }
});

// PUT /api/auth/profile — update display name
router.put('/profile', verifyToken, async (req, res) => {
    const name = (req.body.name || '').trim();

    if (!name) {
        return res.status(400).json({ error: 'Name cannot be empty.' });
    }
    if (name.length > 100) {
        return res.status(400).json({ error: 'Name is too long (max 100 characters).' });
    }

    try {
        await pool.query('UPDATE users SET name = ? WHERE id = ?', [name, req.user.id]);
        const [rows] = await pool.query(
            'SELECT id, name, email, role FROM users WHERE id = ?',
            [req.user.id]
        );
        res.json({ user: rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Server error updating profile.' });
    }
});

// PUT /api/auth/password — change password (requires current password)
router.put('/password', verifyToken, async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Please provide your current and new password.' });
    }
    if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters.' });
    }

    try {
        const [rows] = await pool.query('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const valid = await bcrypt.compare(currentPassword, rows[0].password_hash);
        if (!valid) {
            return res.status(400).json({ error: 'Current password is incorrect.' });
        }

        const salt = await bcrypt.genSalt(10);
        const newHash = await bcrypt.hash(newPassword, salt);
        await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, req.user.id]);

        res.json({ message: 'Password updated successfully.' });
    } catch (err) {
        res.status(500).json({ error: 'Server error updating password.' });
    }
});

module.exports = router;