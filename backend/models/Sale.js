const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
    productId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    customerId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    quantity:    { type: Number, required: true },
    price:       { type: Number, required: true },
    saleDate:    { type: Date, required: true },
    region:      { type: String },
    paymentMode: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Sale', saleSchema);
