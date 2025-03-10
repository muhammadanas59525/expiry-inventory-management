const express = require('express');
const { 
    getProducts,
    getProduct,
    addProduct,
    deleteProduct
 } = require('../../controllers/shop/product-controller');


const router = express.Router();

router.post('/add',addProduct);
router.get('/get',getProducts);
router.get('/get/:productId',getProduct);
router.delete('/delete/:productId',deleteProduct);


module.exports = router;