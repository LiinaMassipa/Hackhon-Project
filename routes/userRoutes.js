const express = require('express');
const router = express.Router();
const pool = require('../db');
const verifyToken = require('../middleware/auth');

// GET /api/users/:id - Fetch user public profile
router.get('/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const [rows] = await pool.query(
            'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
            [userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user: rows[0] });
    } catch (err) {
        // Fallback response if database is unavailable or table lacks columns
        res.status(500).json({ error: 'Failed to retrieve user profile' });
    }
});

// PUT /api/users/:id - Update user profile (protected)
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const userId = req.params.id;
        // Verify current user is updating their own profile
        if (req.user && String(req.user.id) !== String(userId)) {
            return res.status(403).json({ error: 'Unauthorized to edit this profile' });
        }

        const { name } = req.body;
        if (name) {
            await pool.query('UPDATE users SET name = ? WHERE id = ?', [name, userId]);
        }

        res.json({ message: 'Profile updated successfully', user: { id: userId, name } });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update user profile' });
    }
});

module.exports = router;

