const router = require('express').Router();
const Calibration = require('../models/Calibration');
const Equipment = require('../models/Equipment');
const verify = require('../middleware/auth');

// GET ALL CALIBRATIONS (Global History)
router.get('/', verify, async (req, res) => {
    try {
        const history = await Calibration.find()
            .populate('equipment', 'name serialNumber')
            .sort({ date: -1 });
        res.json(history);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET HISTORY FOR EQUIPMENT
router.get('/:equipmentId', verify, async (req, res) => {
    try {
        const history = await Calibration.find({ equipment: req.params.equipmentId }).sort({ date: -1 });
        res.json(history);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// RECORD CALIBRATION
router.post('/', verify, async (req, res) => {
    const calibration = new Calibration({
        equipment: req.body.equipmentId,
        date: req.body.date,
        performedBy: req.body.performedBy,
        certificateNumber: req.body.certificateNumber,
        status: req.body.status,
        notes: req.body.notes,
        nextCalibrationDate: req.body.nextCalibrationDate
    });

    try {
        const savedCalibration = await calibration.save();

        // Update Equipment's last and next calibration dates
        await Equipment.findByIdAndUpdate(req.body.equipmentId, {
            lastCalibrationDate: req.body.date,
            nextCalibrationDate: req.body.nextCalibrationDate,
            status: req.body.status === 'Fail' ? 'Inactive' : 'Active'
        });

        res.status(201).json(savedCalibration);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
