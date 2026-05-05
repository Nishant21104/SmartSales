const mongoose = require('mongoose');

const uploadHistorySchema = new mongoose.Schema({
    fileName:     { type: String, required: true },
    totalRecords: { type: Number, default: 0 },
    userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('UploadHistory', uploadHistorySchema);
