const mongoose = require("mongoose");

const visitSchema = new mongoose.Schema({
    timestamp: {
        type: Date,
        default: Date.now
    },
    page: {
        type: String,
        default: "index"
    }
});

module.exports = mongoose.model("Visit", visitSchema);
