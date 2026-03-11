const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },

    price: {
        type: Number,
        required: true
    },

    category: {
        type: String
    },

    image: {
        type: String
    },

    description: {
        type: String
    },

    isAvailable: {
        type: Boolean,
        default: true
    }

});

module.exports = mongoose.model("Menu", menuSchema);