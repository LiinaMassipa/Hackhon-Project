const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const {
    getCurrentUserProfile,
    updateCurrentUserProfile,
    getUserById
} = require('../controllers/userController');

// Protected current user profile endpoints
router.get('/profile', verifyToken, getCurrentUserProfile);
router.put('/profile', verifyToken, updateCurrentUserProfile);

// Specific user by id endpoints
router.get('/:id', getUserById);
router.put('/:id', verifyToken, updateCurrentUserProfile);

module.exports = router;
