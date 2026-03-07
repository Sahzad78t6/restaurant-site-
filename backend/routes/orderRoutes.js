const express = require("express");
const router = express.Router();

const Order = require("../models/Order");


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