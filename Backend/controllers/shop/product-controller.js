const Product=require('../../models/product.model')


const addProduct=async(req,res)=>{
    try {
        const {
            serialNumber,name,quantity,price,discount,expiryDate,manufactureDate,imageUrl
            
        }=req.body;
        const product = new Product({
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
const getProducts=async(req,res)=>{
    try {
        const products = await Product.find({});
        res.status(200).json({
            success:true,
            data:products,
            message:"All Products fetched successfully"
        });
    } catch (err) {
        console.log(err,"Internal Server Error");
        res.status(500).json({
            message:"Internal Server Error"
        });
    }
}

const getProduct=async(req,res)=>{
    try {
        const{productId}=req.params;
        const product = await Product.findById(productId);
        res.status(200).json({
            success:true,
            data:product,
            message:"Product fetched successfully"
        });
    } catch (err) {
        console.log(err,"Internal Server Error");
        res.status(500).json({
            message:"Internal Server Error"
        });
    }
}



module.exports={
    getProducts,
    getProduct,
    addProduct  
}