const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

name:{
type:String,
required:true
},

email:{
type:String,
required:true,
unique:true
},

phone:{
type:String
},

password:{
type:String
},

googleId:{
type:String
},

role:{
type:String,
enum:["customer","admin","delivery"],
default:"customer"
}

});

module.exports = mongoose.model("User",userSchema);