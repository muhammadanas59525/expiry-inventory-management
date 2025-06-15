const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const auth = require('../middleware/auth');

// Public routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/password/reset-request', AuthController.requestPasswordReset);
router.post('/password/reset', AuthController.resetPassword);

// Protected routes
router.use(auth);
router.get('/profile', AuthController.getProfile);
router.put('/profile', AuthController.updateProfile);
router.post('/password/change', AuthController.changePassword);
router.post('/logout', AuthController.logout);
router.get('/verify', AuthController.verify);

module.exports = router;