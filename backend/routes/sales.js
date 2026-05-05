const express  = require('express');
const Sale     = require('../models/Sale');
const { protect } = require('../Middleware/auth');
const router   = express.Router();

// GET /api/sales — with optional filters
router.get('/', protect, async (req, res) => {
    try {
        const { productId, categoryId, year, month, region } = req.query;
        const filter = { userId: req.user._id };

        if (productId) filter.productId = productId;
        if (region)    filter.region    = region;

        let sales = await Sale.find(filter)
            .populate({ path: 'productId', populate: { path: 'categoryId' } })
            .populate('customerId')
            .sort({ saleDate: -1 });

        // Filter by category
        if (categoryId)
            sales = sales.filter(s => s.productId?.categoryId?._id?.toString() === categoryId);

        // Filter by year/month
        if (year)  sales = sales.filter(s => new Date(s.saleDate).getFullYear() === parseInt(year));
        if (month) sales = sales.filter(s => new Date(s.saleDate).getMonth() + 1 === parseInt(month));

        res.json(sales);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/sales
router.post('/', protect, async (req, res) => {
    try {
        const sale = await Sale.create({ ...req.body, userId: req.user._id });
        res.status(201).json(sale);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE /api/sales/:id
router.delete('/:id', protect, async (req, res) => {
    try {
        await Sale.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;