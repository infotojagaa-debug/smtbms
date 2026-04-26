const express = require('express');
const router = express.Router();
const { register, login, refreshToken, updateProfile } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/register', protect, authorize('Admin'), register);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.put('/update-profile', protect, updateProfile);

module.exports = router;
