const express       = require('express');
const multer        = require('multer');
const XLSX          = require('xlsx');
const path          = require('path');
const Sale          = require('../models/Sale');
const Customer      = require('../models/Customer');
const { Product, Category } = require('../models/Product');
const UploadHistory = require('../models/UploadHistory');
const { protect }   = require('../middleware/auth');
const router        = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

// GET /api/upload/history
router.get('/history', protect, async (req, res) => {
    try {
        const history = await UploadHistory.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json(history);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/upload
router.post('/', protect, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        console.log('📁 File received:', req.file.originalname);
        console.log('📏 File size:', req.file.size);

        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheet    = workbook.Sheets[workbook.SheetNames[0]];
        const rows     = XLSX.utils.sheet_to_json(sheet);

        console.log('📊 Total rows found:', rows.length);
        if (rows.length > 0) {
            console.log('📋 Sample row data:', JSON.stringify(rows[0], null, 2));
            console.log('📋 Available columns:', Object.keys(rows[0]));
        }

        let success = 0;
        const errors = [];

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            try {
                // Support multiple column name formats
                const productName = row['Product Name'] || row.Product || row.product;
                const categoryName = row.Category || row.category || 'General';
                const customerName = row['Customer Name'] || row.Customer || row.CustomerName || row.customer;
                const email = row.Email || row.email || '';
                const city = row.City || row.city || '';
                const quantity = parseInt(row.Quantity || row.quantity) || 1;
                const price = parseFloat(row.Price || row.price) || 0;
                let dateStr = row['Sale Date'] || row.Date || row.date;
                const region = row.Region || row.region || '';
                const paymentMode = row['Payment Mode'] || row.PaymentMode || row.paymentMode || '';

                // Handle Excel serial date numbers
                if (dateStr && typeof dateStr === 'number') {
                    // Convert Excel serial date to JS date
                    const excelDate = new Date((dateStr - 25569) * 86400 * 1000);
                    dateStr = excelDate.toISOString().split('T')[0];
                }

                // Skip if essential fields are missing
                if (!productName || !customerName) {
                    errors.push({ row: i + 2, error: 'Missing Product Name or Customer Name' });
                    continue;
                }

                // Find or create category
                let category = await Category.findOne({ name: categoryName, userId: req.user._id });
                if (!category)
                    category = await Category.create({ name: categoryName, userId: req.user._id });

                // Find or create product
                let product = await Product.findOne({ name: productName, userId: req.user._id });
                if (!product)
                    product = await Product.create({ name: productName, categoryId: category._id, userId: req.user._id });

                // Find or create customer
                let customer = await Customer.findOne({ name: customerName, userId: req.user._id });
                if (!customer)
                    customer = await Customer.create({ name: customerName, email, city, userId: req.user._id });

                // Create sale
                await Sale.create({
                    productId:   product._id,
                    customerId:  customer._id,
                    userId:      req.user._id,
                    quantity:    quantity,
                    price:       price,
                    saleDate:    dateStr ? new Date(dateStr) : new Date(),
                    region:      region,
                    paymentMode: paymentMode,
                });

                success++;
            } catch (rowErr) {
                console.log(`❌ Row ${i + 2} error:`, rowErr.message);
                console.log(`❌ Row ${i + 2} data:`, JSON.stringify(row, null, 2));
                errors.push({ row: i + 2, error: rowErr.message });
            }
        }

        // Save upload history
        await UploadHistory.create({
            fileName:     req.file.originalname,
            totalRecords: success,
            userId:       req.user._id,
        });

        console.log(`📊 Upload complete: ${success} success, ${errors.length} errors`);
        if (errors.length > 0) {
            console.log('🔍 First few errors:', errors.slice(0, 3));
        }
        res.json({ message: `${success} records imported`, errors, success, totalErrors: errors.length });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/download-template
router.get('/download-template', (req, res) => {
    const filePath = path.join(__dirname, '../sample-template.xlsx');
    res.download(filePath, 'sample-sales-template.xlsx', (err) => {
        if (err) {
            console.error('Download error:', err);
            res.status(500).json({ message: 'Template download failed' });
        }
    });
});

module.exports = router;