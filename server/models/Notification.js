const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['overdue', 'return', 'discontinued'],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    equipment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Equipment',
        required: true
    },
    read: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Notification', NotificationSchema);
