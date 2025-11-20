const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    serialNumber: { type: String, required: true, unique: true },
    modelNumber: { type: String },
    manufacturer: { type: String },
    location: { type: String },
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'Out for Calibration', 'Maintenance', 'Reserve', 'Discontinued'],
        default: 'Active'
    },
    lastCalibrationDate: { type: Date },
    nextCalibrationDate: { type: Date },
    calibrationFrequencyInMonths: { type: Number, default: 12 },
    calibrationSentDate: { type: Date },
    calibrationLab: { type: String },
    calibrationReturnDate: { type: Date },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    documents: [{
        name: String,
        filePath: String,
        uploadDate: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Equipment', equipmentSchema);
