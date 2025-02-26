require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const productRoutes = require('./routes/shop/product-routes');
const billingRoutes = require('./routes/shop/billing-routes');


const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/products', productRoutes);
app.use('/api/billings', billingRoutes);


app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});

mongoose.connect(process.env.MONGO_URI,)
    .then(() => console.log("Mong DB connected Successfully"))
    .catch((err) => console.log(err));