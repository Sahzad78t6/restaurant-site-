const express = require("express");
const router = express.Router();
const User = require("../models/User");

const { OAuth2Client } = require('google-auth-library');
// Hardcoded client ID to ensure Render and local testing both work without ENV conflicts right away
const client = new OAuth2Client("202166681296-2vbnjbi9cln832c8dg2bus3u2sjgrbrg.apps.googleusercontent.com");

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
            // First time login - auto-create account
            user = new User({
                name,
                email,
                googleId,
                // Make a random password just to satisfy model just in case, or leave blank if optional handled
            });
            await user.save();
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