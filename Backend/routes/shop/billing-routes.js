const express = require('express');
const {
    getBillings,
    addBilling
} = require('../../controllers/shop/billing-controller');

const router = express.Router();


router.get('/get', getBillings);
router.post('/add', addBilling);

module.exports = router;