const express = require('express');

const {
    register,
    login,
    getProfile,
    updateProfile,
    updatePassword,
    uploadAvatarImage
} = require('../controllers/authController');

const uploadAvatar = require('../middleware/uploadAvatar');

const {
    authenticate
} = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getProfile);
router.patch('/profile', authenticate, updateProfile);
router.patch('/password', authenticate, updatePassword);
router.post('/avatar', authenticate, uploadAvatar.single('avatar'), uploadAvatarImage);

module.exports = router;