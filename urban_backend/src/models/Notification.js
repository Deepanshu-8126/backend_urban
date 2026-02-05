const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Admin ID or User ID
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['complaint', 'system', 'alert'], default: 'system' },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
