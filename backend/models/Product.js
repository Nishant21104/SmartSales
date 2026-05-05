const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name:   { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

const productSchema = new mongoose.Schema({
    name:       { type: String, required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema);
const Product   = mongoose.model('Product', productSchema);

module.exports = { Category, Product };
