const Billing = require('../../models/billing.model');
const Product = require('../../models/product.model');
const User = require('../../models/user.model');


const getBillings = async (req, res) => {
    try {
        const billings = await Billing.find().populate('products.product').populate('user_id');
        res.json(billings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


// const addBilling = async (req, res) => {
//     const { user_id, total } = req.body;
//     try {
//         const billing = new Billing({ user_id, products, total });
//         await billing.save();
//         res.status(201).json(billing);
//     } catch (error) {
//         res.status(400).json({ message: error.message });
//     }
// }

const addBilling=async(req,res)=>{
    try {
        const {
            serialNumber:slno,name:pname,quantity,price,discount,expiryDate,manufactureDate
    
        }=req.body;
        const billProduct = new Product({
            serialNumber,
            name,
            quantity,
            price,
            discount,
            expiryDate,
            manufactureDate,
            imageUrl
        });
        await product.save();
        res.status(201).json({
            success:true,
            data:product,
            message:"Product added successfully"
        });
    } catch (err) {
        console.log(err,"Internal Server Error");
        res.status(500).json({
            message:"Internal Server Error"
        });
        
    }
}


module.exports = {
    getBillings,
    addBilling
};