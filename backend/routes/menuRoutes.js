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
// DELETE MENU ITEM
router.delete("/:id", async (req, res) => {
  try {
    const item = await Menu.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json({ success: true, message: "Item deleted successfully" });
  } catch (err) {
    res.status(500).json(err);
  }
});

// TOGGLE ITEM AVAILABILITY
router.put("/toggle/:id", async (req, res) => {
  try {
    const item = await Menu.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    // Default to true if not set before, then toggle
    item.isAvailable = item.isAvailable === false ? true : false;
    await item.save();

    res.json({ success: true, isAvailable: item.isAvailable });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;