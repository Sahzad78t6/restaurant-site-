const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({

userId:{
type:mongoose.Schema.Types.ObjectId,
ref:"User",
required:true
},

items:[
{
name:String,
price:Number,
qty:{
type:Number,
default:1
}
}
],

total:{
type:Number,
required:true
},

phone:{
type:String,
required:true
},

address:{
type:String,
required:true
},

status:{
type:String,
enum:["Accepted","Kitchen","On Way","Arrived"],
default:"Accepted"
},
paymentMethod:{
type:String,
default:"COD"
},

paymentCollected:{
type:Boolean,
default:false
},
deliveryLocation:{
lat:Number,
lng:Number
},
deliveryBoyId:{
type:mongoose.Schema.Types.ObjectId,
ref:"User",
default:null
}

},{
timestamps:true
});

module.exports = mongoose.model("Order",orderSchema);