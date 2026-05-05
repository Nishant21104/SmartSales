const express = require('express');
const Sale    = require('../models/Sale');
const { protect } = require('../Middleware/auth');
const router  = express.Router();

// GET /api/dashboard
router.get('/', protect, async (req, res) => {
    try {
        const { productId, categoryId, year, month, region } = req.query;
        const filter = { userId: req.user._id };

        if (productId) filter.productId = productId;
        if (region)    filter.region    = region;

        let sales = await Sale.find(filter)
            .populate({ path: 'productId', populate: { path: 'categoryId' } })
            .populate('customerId');

        if (categoryId)
            sales = sales.filter(s => s.productId?.categoryId?._id?.toString() === categoryId);
        if (year)
            sales = sales.filter(s => new Date(s.saleDate).getFullYear() === parseInt(year));
        if (month)
            sales = sales.filter(s => new Date(s.saleDate).getMonth() + 1 === parseInt(month));

        // KPIs
        const totalRevenue  = sales.reduce((sum, s) => sum + s.price * s.quantity, 0);
        const totalOrders   = sales.length;
        const totalProducts = [...new Set(sales.map(s => s.productId?._id?.toString()))].length;

        // Monthly trend
        const monthlyMap = {};
        sales.forEach(s => {
            const d   = new Date(s.saleDate);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            monthlyMap[key] = (monthlyMap[key] || 0) + s.price * s.quantity;
        });
        const monthly = Object.entries(monthlyMap)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([month, total]) => ({ month, total }));

        // Category data
        const catMap = {};
        sales.forEach(s => {
            const name = s.productId?.categoryId?.name || 'Unknown';
            catMap[name] = (catMap[name] || 0) + s.price * s.quantity;
        });
        const categoryData = Object.entries(catMap)
            .map(([name, total]) => ({ name, total }))
            .sort((a, b) => b.total - a.total);

        // Region data
        const regMap = {};
        sales.forEach(s => {
            const name = s.region || 'Unknown';
            regMap[name] = (regMap[name] || 0) + s.price * s.quantity;
        });
        const regionData = Object.entries(regMap)
            .map(([name, total]) => ({ name, total }))
            .sort((a, b) => b.total - a.total);

        // Growth % — current month vs previous month
        const now      = new Date();
        const curMonth = now.getMonth() + 1;
        const curYear  = now.getFullYear();
        const prevMonth = curMonth === 1 ? 12 : curMonth - 1;
        const prevYear  = curMonth === 1 ? curYear - 1 : curYear;

        const allSales = await Sale.find({ userId: req.user._id });
        const curRev  = allSales.filter(s => {
            const d = new Date(s.saleDate);
            return d.getMonth() + 1 === curMonth && d.getFullYear() === curYear;
        }).reduce((sum, s) => sum + s.price * s.quantity, 0);

        const prevRev = allSales.filter(s => {
            const d = new Date(s.saleDate);
            return d.getMonth() + 1 === prevMonth && d.getFullYear() === prevYear;
        }).reduce((sum, s) => sum + s.price * s.quantity, 0);

        const growthPercentage = prevRev > 0
            ? parseFloat((((curRev - prevRev) / prevRev) * 100).toFixed(1))
            : 0;

        res.json({ totalRevenue, totalOrders, totalProducts, growthPercentage, monthly, categoryData, regionData });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;