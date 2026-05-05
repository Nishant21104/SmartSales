const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
    role:    { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
}, { timestamps: true });

const chatSessionSchema = new mongoose.Schema({
    title:    { type: String, default: 'New Chat' },
    userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    messages: [chatMessageSchema],
}, { timestamps: true });

module.exports = mongoose.model('ChatSession', chatSessionSchema);
