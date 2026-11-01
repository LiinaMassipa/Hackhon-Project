const jwt = require('jsonwebtoken');

module.exports = function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET || 'hackathon_secret_key');
        req.user = verified;
        next();
    } catch (err) {
        res.status(403).json({ error: 'Invalid or expired token.' });
    }
};