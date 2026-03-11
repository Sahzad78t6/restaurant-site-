const express = require("express");
const router = express.Router();
const Visit = require("../models/Visit");
const Order = require("../models/Order");

// LOG A NEW VISIT
router.post("/visit", async (req, res) => {
    try {
        const { page } = req.body;
        const newVisit = new Visit({ page: page || 'index' });
        await newVisit.save();
        res.status(200).json({ success: true, message: "Visit recorded" });
    } catch (err) {
        console.error("Error recording visit:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET ANALYTICS STATS (Visits, Orders, Revenue)
router.get("/stats", async (req, res) => {
    try {
        const { filter } = req.query; // 'day', 'week', 'month'

        // Calculate the cutoff date based on filter
        const now = new Date();
        let cutoffDate = new Date();

        if (filter === "day") {
            cutoffDate.setHours(0, 0, 0, 0); // Start of today
        } else if (filter === "week") {
            // Start of current week (assuming Sunday as start)
            const day = cutoffDate.getDay();
            const diff = cutoffDate.getDate() - day;
            cutoffDate.setDate(diff);
            cutoffDate.setHours(0, 0, 0, 0);
        } else if (filter === "month") {
            cutoffDate.setDate(1); // Start of current month
            cutoffDate.setHours(0, 0, 0, 0);
        } else {
            // Default to 'All Time' if no valid filter provided
            cutoffDate = new Date(0);
        }

        // 1. Get Visits in Timeframe
        const visits = await Visit.find({
            timestamp: { $gte: cutoffDate }
        }).sort({ timestamp: -1 });
        const visitsCount = visits.length;

        // 2. Get Orders & Revenue in Timeframe
        const orders = await Order.find({
            createdAt: { $gte: cutoffDate },
            status: { $nin: ["Cancelled", "cancelled"] }
        }).populate('userId').sort({ createdAt: -1 });

        const ordersCount = orders.length;

        // Calculate revenue
        let revenue = 0;
        const ordersWithCalculatedRevenue = orders.map(order => {
            let orderRevenue = 0;
            // The Order schema stores the price as 'total' and items as 'items'
            if (order.total && order.total > 0) {
                orderRevenue = Number(order.total);
            } else if (order.items && order.items.length > 0) {
                order.items.forEach(item => {
                    orderRevenue += (Number(item.price) || 0) * (Number(item.qty) || 1);
                });
            }
            revenue += orderRevenue;

            // Return a clean version of the order with its parsed revenue for the frontend table
            // Customer name comes from the populated userId field
            return {
                _id: order._id,
                customerName: order.userId?.name || "Unknown",
                phone: order.phone || "Unknown",
                status: order.status,
                createdAt: order.createdAt,
                revenue: orderRevenue,
                itemsCount: order.items?.length || 0,
                items: order.items || []
            };
        });

        res.status(200).json({
            success: true,
            visits: visitsCount,
            orders: ordersCount,
            revenue: revenue,
            filterUsed: filter || 'all',
            // Detailed Arrays
            visitsData: visits,
            ordersData: ordersWithCalculatedRevenue
        });

    } catch (err) {
        console.error("Error fetching stats:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
