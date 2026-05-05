const express = require('express');
const Customer = require('../models/Customer');
const { protect } = require('../middleware/auth');
const router = express.Router();

// POST /api/customers
router.post('/', protect, async (req, res) => {
    try {
        const { name, email, city } = req.body;
        
        if (!name) {
            return res.status(400).json({ message: 'Customer name is required' });
        }

        // Check if customer already exists
        const existingCustomer = await Customer.findOne({ 
            name: name.trim(), 
            userId: req.user._id 
        });
        
        if (existingCustomer) {
            return res.status(400).json({ message: 'Customer with this name already exists' });
        }

        const customer = await Customer.create({
            name: name.trim(),
            email: email?.trim() || '',
            city: city?.trim() || '',
            userId: req.user._id
        });

        res.status(201).json(customer);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/customers/:id
router.put('/:id', protect, async (req, res) => {
    try {
        const { name, email, city } = req.body;
        
        if (!name) {
            return res.status(400).json({ message: 'Customer name is required' });
        }

        const customer = await Customer.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { 
                name: name.trim(),
                email: email?.trim() || '',
                city: city?.trim() || ''
            },
            { new: true }
        );

        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        res.json(customer);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE /api/customers/:id
router.delete('/:id', protect, async (req, res) => {
    try {
        const customer = await Customer.findOneAndDelete({ 
            _id: req.params.id, 
            userId: req.user._id 
        });

        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        res.json({ message: 'Customer deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
