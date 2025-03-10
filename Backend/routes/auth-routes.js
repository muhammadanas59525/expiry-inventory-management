const express = require('express');
const { verifyToken } = require('../controllers/shop/auth-controller');

const router = express.Router();

router.get('/verify', verifyToken);

module.exports = router;