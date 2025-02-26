const express = require('express');
const { 
    getProducts,
    getProduct,
    addProduct
 } = require('../../controllers/shop/product-controller');


const router = express.Router();

router.post('/add',addProduct);
router.get('/get',getProducts);
router.get('/get/:productId',getProduct);


module.exports = router;