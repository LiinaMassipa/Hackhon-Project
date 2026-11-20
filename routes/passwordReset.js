const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const { sendPasswordResetEmail } = require('../utils/mailer');

const JWT_SECRET = process.env.JWT_SECRET || 'hackathon_secret_key';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const GENERIC_MESSAGE =
    'If an account with that email exists, we have sent a password reset link to it.';

/*
 * How reset links work (no extra database table needed):
 * the link holds a JWT that is signed with JWT_SECRET *plus the user's current
 * password hash*. So the link:
 *   - expires after 1 hour,
 *   - stops working the moment the password changes (the hash changes), which
 *     makes every link single-use,
 *   - can never be used as a normal login token (different signing key).
 */
function resetKey(passwordHash) {
    return JWT_SECRET + passwordHash;
}

// Tiny in-memory limiter: max 3 reset emails per address per 15 minutes,
// so the form can't be used to flood someone's inbox.
const attempts = new Map();
function tooManyRequests(email) {
    const now = Date.now();
    const windowMs = 15 * 60 * 1000;
    const recent = (attempts.get(email) || []).filter((t) => now - t < windowMs);
    if (recent.length >= 3) {
        attempts.set(email, recent);
        return true;
    }
    recent.push(now);
    attempts.set(email, recent);
    return false;
}

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';

    if (!email) {
        return res.status(400).json({ error: 'Please enter your email address.' });
    }

    try {
        const [rows] = await pool.query('SELECT id, email, password_hash FROM users WHERE email = ?', [email]);

        // The response is identical whether or not the account exists, so this
        // endpoint can't be used to find out who has an account.
        if (rows.length > 0 && !tooManyRequests(email)) {
            const user = rows[0];
            const token = jwt.sign({ id: user.id, purpose: 'password-reset' }, resetKey(user.password_hash), {
                expiresIn: '1h',
            });
            const link = `${FRONTEND_URL}/reset-password?token=${encodeURIComponent(token)}`;

            // Not awaited, so response time doesn't reveal whether the account exists
            sendPasswordResetEmail(user.email, link).catch((err) =>
                console.error('Failed to send password reset email:', err.message)
            );
        }

        res.json({ message: GENERIC_MESSAGE });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error. Please try again.' });
    }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
    const { token, password } = req.body;
    const invalid = { error: 'This reset link is invalid or has expired. Please request a new one.' };

    if (typeof token !== 'string' || !token) {
        return res.status(400).json(invalid);
    }
    if (typeof password !== 'string' || password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    try {
        // Read the user id first (unverified), then verify with that user's own key
        const claims = jwt.decode(token);
        if (!claims || !claims.id) {
            return res.status(400).json(invalid);
        }

        const [rows] = await pool.query('SELECT id, password_hash FROM users WHERE id = ?', [claims.id]);
        if (rows.length === 0) {
            return res.status(400).json(invalid);
        }
        const user = rows[0];

        let verified;
        try {
            verified = jwt.verify(token, resetKey(user.password_hash), { algorithms: ['HS256'] });
        } catch {
            return res.status(400).json(invalid);
        }
        if (verified.purpose !== 'password-reset' || verified.id !== user.id) {
            return res.status(400).json(invalid);
        }

        const salt = await bcrypt.genSalt(10);
        const newHash = await bcrypt.hash(password, salt);
        await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, user.id]);

        res.json({ message: 'Password updated. You can now log in with your new password.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error. Please try again.' });
    }
});

module.exports = router;
