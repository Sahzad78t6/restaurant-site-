const express = require("express");
const router = express.Router();

const Menu = require("../models/Menu");

// GET MENU
router.get("/", async (req, res) => {
  const items = await Menu.find();
  res.json(items);
});

// ADD MENU ITEM
router.post("/add", async (req, res) => {
  try {
    const item = new Menu(req.body);
    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;