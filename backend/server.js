require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const orderRoutes = require("./routes/orderRoutes");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);

app.get("/", (req, res) => {
    res.send("Royal Sweets API Running 🚀");
});

const menuRoutes = require("./routes/menuRoutes");
const trackerRoutes = require("./routes/trackerRoutes");

app.use("/api/menu", menuRoutes);
app.use("/api/tracker", trackerRoutes);

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});