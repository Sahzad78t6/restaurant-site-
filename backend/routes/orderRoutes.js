const express = require("express");
const router = express.Router();

const Order = require("../models/Order");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const razorpay = new Razorpay({
key_id: process.env.RAZORPAY_KEY_ID,
key_secret: process.env.RAZORPAY_KEY_SECRET,
});


/* CREATE ORDER */

router.post("/create", async (req,res)=>{

try{

const {userId,items,total,phone,address} = req.body;

const order = new Order({
userId,
items,
total,
phone,
address
});

await order.save();

res.json(order);

}catch(err){

console.log(err);
res.status(500).json({message:"Order creation failed"});

}

});

/* RAZORPAY CREATE ORDER (Gets Order ID from Razorpay) */

router.post("/razorpay/create-order", async (req,res)=>{

try{
    const {amount} = req.body; // Amount in INR

    const options = {
        amount: Math.round(amount * 100), // convert to paise
        currency: "INR",
        receipt: "receipt_order_" + Math.random().toString(36).substring(7)
    };

    const order = await razorpay.orders.create(options);

    if(!order){
        return res.status(500).json({message:"Failed to create Razorpay order"});
    }

    res.json(order);

}catch(err){

console.log(err);
res.status(500).json({message:"Razorpay Order creation failed"});

}

});

/* RAZORPAY VERIFY PAYMENT & SAVE ORDER TO DB */

router.post("/razorpay/verify", async (req,res)=>{

try{
    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        userId,
        items,
        total,
        phone,
        address
    } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSign = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(sign.toString())
        .digest("hex");

    console.log("== RAZORPAY VERIFY ==");
    console.log("Expected: ", expectedSign);
    console.log("Received: ", razorpay_signature);
    
    if (razorpay_signature === expectedSign) {

        // Signature valid. Create Physical order in Mongo.

        const order = new Order({
            userId,
            items,
            total,
            phone,
            address,
            status: "Accepted",
            paymentMethod: "Online",
            paymentCollected: true
        });

        await order.save();

        res.json({ success: true, message: "Payment verified successfully", order });
        
    } else {
         res.status(400).json({ success: false, message: "Invalid signature" });
    }


}catch(err){

console.log(err);
res.status(500).json({message:"Razorpay verification failed"});

}

});
/* GET ALL ORDERS (Delivery Panel) */

router.get("/", async (req,res)=>{

try{

const orders = await Order.find().sort({createdAt:-1});

res.json(orders);

}catch(err){

res.status(500).json({message:"Error fetching orders"});

}

});


/* GET ORDERS OF USER */

router.get("/user/:id", async (req,res)=>{

try{

const orders = await Order.find({userId:req.params.id}).sort({createdAt:-1});

res.json(orders);

}catch(err){

res.status(500).json({message:"Error fetching user orders"});

}

});


/* UPDATE ORDER STATUS */

router.put("/status/:id", async (req,res)=>{

try{

const {status} = req.body;

await Order.findByIdAndUpdate(req.params.id,{status});

res.json({message:"Status updated"});

}catch(err){

res.status(500).json({message:"Status update failed"});

}

});

router.put("/collect-payment/:id", async(req,res)=>{

const {method} = req.body;

const order = await Order.findByIdAndUpdate(

req.params.id,

{
paymentCollected:true,
paymentMethod:method
},

{new:true}

);

res.json(order);

});
router.put("/location/:id", async(req,res)=>{

const {lat,lng} = req.body;

const order = await Order.findByIdAndUpdate(

req.params.id,
{
deliveryLocation:{lat,lng}
},
{new:true}

);

res.json(order);

});
module.exports = router;