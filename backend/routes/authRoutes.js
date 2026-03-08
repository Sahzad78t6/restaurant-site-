const express = require("express");
const router = express.Router();
const User = require("../models/User");

const { OAuth2Client } = require('google-auth-library');
// Hardcoded client ID to ensure Render and local testing both work without ENV conflicts right away
const client = new OAuth2Client("202166681296-2vbnjbi9cln832c8dg2bus3u2sjgrbrg.apps.googleusercontent.com");

router.post("/signup", async (req,res)=>{

try{

const { name, email, phone, password, googleId } = req.body;

// Enforce phone requirement
if(!phone) {
    return res.status(400).json({message: "Phone number is required."});
}

const user = new User({
    name,
    email,
    phone,
    password,
    googleId
});

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

// Google Login/Signup Route
router.post("/google", async (req, res) => {
    try {
        const { token } = req.body;

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: "202166681296-2vbnjbi9cln832c8dg2bus3u2sjgrbrg.apps.googleusercontent.com"
        });

        const payload = ticket.getPayload();
        const { email, name, sub: googleId } = payload;

        // Check if user exists by googleId or email
        let user = await User.findOne({ $or: [{ googleId }, { email }] });

        if (!user) {
            // Send back a 404 with the google details to pre-fill the signup form
            return res.status(404).json({
                message: "User not found. Please complete signup.",
                googleData: {
                    name,
                    email,
                    googleId
                }
            });
        } else if (!user.googleId) {
            // Found by email, link google account
            user.googleId = googleId;
            await user.save();
        }

        res.json(user);

    } catch (err) {
        console.error("Google Auth Error:", err);
        res.status(500).json({ message: "Google Authentication Failed" });
    }
});

module.exports = router;