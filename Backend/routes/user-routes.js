const express = require('express');
const {
    registerUser, loginUser, getUserProfile, updateUserProfile
} = require('../controllers/shop/user-controller');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile); // Add this new route


module.exports = router;