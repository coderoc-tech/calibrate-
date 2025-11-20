const mongoose = require('mongoose');

const calibrationSchema = new mongoose.Schema({
    equipment: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment', required: true },
    date: { type: Date, required: true },
    performedBy: { type: String, required: true }, // External vendor or internal user
    certificateNumber: { type: String },
    status: {
        type: String,
        enum: ['Pass', 'Fail', 'Conditional Pass'],
        default: 'Pass'
    },
    notes: { type: String },
    nextCalibrationDate: { type: Date },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Calibration', calibrationSchema);
