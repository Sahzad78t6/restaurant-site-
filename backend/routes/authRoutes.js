const express = require("express");
const router = express.Router();

const User = require("../models/User");

router.post("/signup", async (req,res)=>{

try{

const user = new User(req.body);

await user.save();

res.json({message:"User created"});

}catch(err){

res.status(500).json(err);

}

});

router.post("/login", async (req,res)=>{

const {email,password} = req.body;

const user = await User.findOne({email,password});

if(!user){

return res.status(401).json({message:"Invalid credentials"});

}

res.json(user);

});

module.exports = router;