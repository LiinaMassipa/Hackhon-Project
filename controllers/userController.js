const pool = require('../db');

/**
 * Controller to handle user profile retrieval, onboarding, and updates
 */

// Helper to format user row into standard profile schema
function formatUserProfile(user) {
    if (!user) return null;

    const hasProfileData = Boolean(
        user.bio || 
        user.headline || 
        user.skills || 
        user.avatar_url || 
        user.location || 
        user.github_url || 
        user.linkedin_url || 
        user.website_url
    );

    return {
        id: user.id,
        name: user.name,
        username: user.username || user.name.toLowerCase().replace(/\s+/g, '_'),
        email: user.email,
        role: user.role || 'user',
        bio: user.bio || '',
        headline: user.headline || '',
        skills: user.skills || '',
        avatarUrl: user.avatar_url || '',
        location: user.location || '',
        socialLinks: {
            github: user.github_url || '',
            linkedin: user.linkedin_url || '',
            website: user.website_url || '',
            twitter: user.twitter_url || ''
        },
        createdAt: user.created_at,
        hasProfileData
    };
}

// GET /api/users/profile - Get current authenticated user profile
const getCurrentUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const profile = formatUserProfile(rows[0]);
        res.json({ user: profile });
    } catch (err) {
        console.error('Error fetching current user profile:', err);
        res.status(500).json({ error: 'Failed to retrieve profile' });
    }
};

// PUT /api/users/profile - Update current authenticated user profile
const updateCurrentUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            name,
            bio,
            headline,
            skills,
            avatarUrl,
            location,
            socialLinks,
            github,
            linkedin,
            website,
            twitter
        } = req.body;

        const githubUrl = socialLinks?.github ?? github ?? '';
        const linkedinUrl = socialLinks?.linkedin ?? linkedin ?? '';
        const websiteUrl = socialLinks?.website ?? website ?? '';
        const twitterUrl = socialLinks?.twitter ?? twitter ?? '';

        try {
            await pool.query(
                `UPDATE users SET 
                    name = COALESCE(?, name),
                    bio = ?,
                    headline = ?,
                    skills = ?,
                    avatar_url = ?,
                    location = ?,
                    github_url = ?,
                    linkedin_url = ?,
                    website_url = ?,
                    twitter_url = ?
                WHERE id = ?`,
                [
                    name || null,
                    bio ?? '',
                    headline ?? '',
                    skills ?? '',
                    avatarUrl ?? '',
                    location ?? '',
                    githubUrl,
                    linkedinUrl,
                    websiteUrl,
                    twitterUrl,
                    userId
                ]
            );
        } catch (dbErr) {
            // Graceful fallback if some profile columns haven't been migrated yet in local DB
            if (dbErr.code === 'ER_BAD_FIELD_ERROR' || dbErr.message.includes('Unknown column')) {
                await pool.query(
                    'UPDATE users SET name = COALESCE(?, name) WHERE id = ?',
                    [name || null, userId]
                );
            } else {
                throw dbErr;
            }
        }

        const [updatedRows] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
        const updatedProfile = formatUserProfile(updatedRows[0]);

        res.json({
            message: 'Profile saved successfully',
            user: updatedProfile
        });
    } catch (err) {
        console.error('Error updating user profile:', err);
        res.status(500).json({ error: 'Failed to update profile' });
    }
};

// GET /api/users/:id - Public profile view
const getUserById = async (req, res) => {
    try {
        const userId = req.params.id;
        const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const profile = formatUserProfile(rows[0]);
        res.json({ user: profile });
    } catch (err) {
        console.error('Error fetching user by ID:', err);
        res.status(500).json({ error: 'Failed to retrieve user profile' });
    }
};

module.exports = {
    getCurrentUserProfile,
    updateCurrentUserProfile,
    getUserById
};

