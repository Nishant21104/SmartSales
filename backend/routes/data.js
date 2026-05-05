const express  = require('express');
const Customer = require('../models/Customer');
const { Product, Category } = require('../models/Product');
const { protect } = require('../middleware/auth');
const router   = express.Router();

// ── CUSTOMERS ──────────────────────────────────────
// GET /api/customers
router.get('/customers', protect, async (req, res) => {
    try {
        const { search, productId, categoryId } = req.query;
        const Sale = require('../models/Sale');

        let customers = await Customer.find({ userId: req.user._id });

        // Attach sales to each customer
        const sales = await Sale.find({ userId: req.user._id })
            .populate({ path: 'productId', populate: { path: 'categoryId' } });

        customers = customers.map(c => {
            let cSales = sales.filter(s => s.customerId?.toString() === c._id.toString());
            if (productId)  cSales = cSales.filter(s => s.productId?._id?.toString() === productId);
            if (categoryId) cSales = cSales.filter(s => s.productId?.categoryId?._id?.toString() === categoryId);
            return {
                _id:     c._id,
                name:    c.name,
                email:   c.email,
                city:    c.city,
                orders:  cSales.length,
                revenue: cSales.reduce((sum, s) => sum + s.price * s.quantity, 0),
            };
        });

        if (search)
            customers = customers.filter(c =>
                c.name?.toLowerCase().includes(search.toLowerCase()) ||
                c.email?.toLowerCase().includes(search.toLowerCase())
            );

        res.json(customers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ── PRODUCTS ───────────────────────────────────────
// GET /api/products
// router.get('/products', protect, async (req, res) => {
//     try {
//         const products = await Product.find({ userId: req.user._id }).populate('categoryId');
//         res.json(products);
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// });
router.get('/products', protect, async (req, res) => {
    try {
        console.log("USER:", req.user); // 👈 ADD THIS
         
        await Product.updateMany(
            { userId: { $exists: false } },
            { $set: { userId: req.user._id } }
        );
        //const products = await Product.find({ userId: req.user._id }).populate('categoryId');
        const products = await Product.find({})
        res.json(products);
    } catch (err) {
        console.log("ERROR IN PRODUCTS:", err); // 👈 ADD
        res.status(500).json({ message: err.message });
    }
});

// POST /api/products
router.post('/products', protect, async (req, res) => {
    try {
        const product = await Product.create({ ...req.body, userId: req.user._id });
        res.status(201).json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ── CATEGORIES ─────────────────────────────────────
// GET /api/categories
router.get('/categories', protect, async (req, res) => {
    try {
        const categories = await Category.find({ userId: req.user._id });
        res.json(categories);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/categories
router.post('/categories', protect, async (req, res) => {
    try {
        const category = await Category.create({ ...req.body, userId: req.user._id });
        res.status(201).json(category);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ── PRODUCT ANALYTICS ──────────────────────────────
// GET /api/analytics/products
router.get('/analytics/products', protect, async (req, res) => {
    try {
        const { categoryId, year, month } = req.query;
        const Sale = require('../models/Sale');

        let sales = await Sale.find({ userId: req.user._id })
            .populate({ path: 'productId', populate: { path: 'categoryId' } });

        if (categoryId) sales = sales.filter(s => s.productId?.categoryId?._id?.toString() === categoryId);
        if (year)  sales = sales.filter(s => new Date(s.saleDate).getFullYear() === parseInt(year));
        if (month) sales = sales.filter(s => new Date(s.saleDate).getMonth() + 1 === parseInt(month));

        const map = {};
        sales.forEach(s => {
            const name = s.productId?.name || 'Unknown';
            if (!map[name]) map[name] = { product: name, quantity: 0, total: 0 };
            map[name].quantity += s.quantity;
            map[name].total    += s.price * s.quantity;
        });

        const result = Object.values(map).sort((a, b) => b.total - a.total);
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ── REGION ANALYTICS ───────────────────────────────
// GET /api/analytics/regions
router.get('/analytics/regions', protect, async (req, res) => {
    try {
        const { year, month } = req.query;
        const Sale = require('../models/Sale');

        let sales = await Sale.find({ userId: req.user._id });

        if (year)  sales = sales.filter(s => new Date(s.saleDate).getFullYear() === parseInt(year));
        if (month) sales = sales.filter(s => new Date(s.saleDate).getMonth() + 1 === parseInt(month));

        const map = {};
        sales.forEach(s => {
            const name = s.region || 'Unknown';
            map[name] = (map[name] || 0) + s.price * s.quantity;
        });

        const result = Object.entries(map)
            .map(([region, total]) => ({ region, total }))
            .sort((a, b) => b.total - a.total);

        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;