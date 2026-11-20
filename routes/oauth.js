const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const verifyToken = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'hackathon_secret_key';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

/*
 * "Log in with Google / GitHub" (OAuth 2.0 authorization-code flow):
 *   1. Browser goes to GET /api/auth/<provider>       -> we redirect to Google/GitHub
 *   2. User approves; the provider redirects to GET /api/auth/<provider>/callback?code=...
 *   3. We swap the code for an access token, read the user's verified email,
 *      find or create the user, and issue our normal JWT
 *   4. We redirect to the frontend (/auth/callback#token=...) which stores it
 */

const providers = {
    google: {
        label: 'Google',
        clientId: () => process.env.GOOGLE_CLIENT_ID,
        clientSecret: () => process.env.GOOGLE_CLIENT_SECRET,
        authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        scope: 'openid email profile',
        async fetchProfile(accessToken) {
            const res = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (!res.ok) throw new Error('Could not read your Google profile.');
            const p = await res.json();
            return {
                email: p.email_verified ? p.email : null,
                name: p.name || p.given_name || null,
            };
        },
    },
    github: {
        label: 'GitHub',
        clientId: () => process.env.GITHUB_CLIENT_ID,
        clientSecret: () => process.env.GITHUB_CLIENT_SECRET,
        authorizeUrl: 'https://github.com/login/oauth/authorize',
        tokenUrl: 'https://github.com/login/oauth/access_token',
        scope: 'read:user user:email',
        async fetchProfile(accessToken) {
            const headers = {
                Authorization: `Bearer ${accessToken}`,
                Accept: 'application/vnd.github+json',
                'User-Agent': 'showcase-gallery', // GitHub rejects requests without one
            };
            const [userRes, emailsRes] = await Promise.all([
                fetch('https://api.github.com/user', { headers }),
                fetch('https://api.github.com/user/emails', { headers }),
            ]);
            if (!userRes.ok || !emailsRes.ok) throw new Error('Could not read your GitHub profile.');
            const u = await userRes.json();
            const emails = await emailsRes.json();

            // Only trust an email GitHub has verified; prefer the primary one
            const verified = Array.isArray(emails) ? emails.filter((e) => e.verified) : [];
            const best = verified.find((e) => e.primary) || verified[0];
            return { email: best ? best.email : null, name: u.name || u.login || null };
        },
    },
};

function redirectUri(provider) {
    return `${BACKEND_URL}/api/auth/${provider}/callback`;
}

// Send the browser back to the login page with a readable error
function failToLogin(res, message) {
    res.redirect(`${FRONTEND_URL}/login?error=${encodeURIComponent(message)}`);
}

// Only allow in-app paths like "/submit" as a post-login destination
function safeNext(value) {
    return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') ? value : '/';
}

Object.entries(providers).forEach(([key, p]) => {
    // Step 1: send the user to Google/GitHub
    router.get(`/${key}`, (req, res) => {
        if (!p.clientId() || !p.clientSecret()) {
            return failToLogin(res, `${p.label} sign-in isn't set up yet.`);
        }

        // Signed "state" proves the callback belongs to a login we started (blocks CSRF)
        const state = jwt.sign(
            { provider: key, next: safeNext(req.query.next), nonce: crypto.randomBytes(8).toString('hex') },
            JWT_SECRET,
            { expiresIn: '10m' }
        );

        const params = new URLSearchParams({
            client_id: p.clientId(),
            redirect_uri: redirectUri(key),
            scope: p.scope,
            state,
        });
        if (key === 'google') params.set('response_type', 'code');

        res.redirect(`${p.authorizeUrl}?${params.toString()}`);
    });

    // Step 2: the provider sends the user back here
    router.get(`/${key}/callback`, async (req, res) => {
        const { code, state, error } = req.query;

        if (error) return failToLogin(res, `${p.label} sign-in was cancelled.`);
        if (typeof code !== 'string' || typeof state !== 'string') {
            return failToLogin(res, `${p.label} sign-in failed. Please try again.`);
        }

        let claims;
        try {
            claims = jwt.verify(state, JWT_SECRET);
            if (claims.provider !== key) throw new Error('provider mismatch');
        } catch {
            return failToLogin(res, 'Your sign-in session expired. Please try again.');
        }

        try {
            // Swap the one-time code for an access token
            const tokenRes = await fetch(p.tokenUrl, {
                method: 'POST',
                headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    client_id: p.clientId(),
                    client_secret: p.clientSecret(),
                    code,
                    redirect_uri: redirectUri(key),
                    grant_type: 'authorization_code',
                }).toString(),
            });
            const tokenData = await tokenRes.json();
            if (!tokenData.access_token) throw new Error('No access token returned.');

            const profile = await p.fetchProfile(tokenData.access_token);
            if (!profile.email) {
                return failToLogin(res, `Your ${p.label} account has no verified email address, so we can't sign you in.`);
            }

            // Find the user by email, or create one on first sign-in
            let [rows] = await pool.query('SELECT id, name, email, role FROM users WHERE email = ?', [profile.email]);
            let user = rows[0];

            if (!user) {
                // Social accounts have no password, so store a random unguessable hash.
                // (They can set a real one later via "Forgot password".)
                const randomHash = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10);
                const name = (profile.name || profile.email.split('@')[0]).slice(0, 100);
                const [result] = await pool.query(
                    'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
                    [name, profile.email, randomHash]
                );
                user = { id: result.insertId, name, email: profile.email, role: 'user' };
            }

            const token = jwt.sign({ id: user.id, email: user.email, role: user.role || 'user' }, JWT_SECRET, {
                expiresIn: '24h',
            });

            // Token goes in the URL *fragment* (#), which browsers never send to servers or logs
            const hash = new URLSearchParams({ token, next: claims.next || '/' }).toString();
            res.redirect(`${FRONTEND_URL}/auth/callback#${hash}`);
        } catch (err) {
            console.error(`${p.label} sign-in error:`, err.message);
            failToLogin(res, `${p.label} sign-in failed. Please try again.`);
        }
    });
});

// GET /api/auth/me — who is logged in? (used by the frontend after social sign-in)
router.get('/me', verifyToken, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, name, email, role FROM users WHERE id = ?', [req.user.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'User not found.' });
        res.json({ user: rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Server error loading your account.' });
    }
});

module.exports = router;
