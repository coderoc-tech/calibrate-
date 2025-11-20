const router = require('express').Router();
const Equipment = require('../models/Equipment');
const verify = require('../middleware/auth');
const { createReturnNotification, createDiscontinuedNotification } = require('../utils/notificationGenerator');

// GET ALL EQUIPMENT
router.get('/', verify, async (req, res) => {
    try {
        const equipment = await Equipment.find();
        res.json(equipment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET ONE EQUIPMENT
router.get('/:id', verify, async (req, res) => {
    try {
        const equipment = await Equipment.findById(req.params.id);
        if (!equipment) return res.status(404).json({ message: 'Equipment not found' });
        res.json(equipment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// CREATE EQUIPMENT
router.post('/', verify, async (req, res) => {
    const equipment = new Equipment({
        name: req.body.name,
        serialNumber: req.body.serialNumber,
        modelNumber: req.body.modelNumber,
        manufacturer: req.body.manufacturer,
        location: req.body.location,
        status: req.body.status,
        lastCalibrationDate: req.body.lastCalibrationDate,
        nextCalibrationDate: req.body.nextCalibrationDate,
        calibrationFrequencyInMonths: req.body.calibrationFrequencyInMonths,
        assignedTo: req.body.assignedTo
    });

    try {
        const newEquipment = await equipment.save();
        res.status(201).json(newEquipment);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// UPDATE EQUIPMENT
router.put('/:id', verify, async (req, res) => {
    try {
        // Get the current equipment state before update
        const currentEquipment = await Equipment.findById(req.params.id);

        const updatedEquipment = await Equipment.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        // Check for status changes and create notifications
        if (currentEquipment && updatedEquipment) {
            // Check if equipment returned from calibration
            if (currentEquipment.status === 'Out for Calibration' &&
                (updatedEquipment.status === 'Active' || updatedEquipment.status === 'Reserve')) {
                await createReturnNotification(
                    updatedEquipment._id,
                    updatedEquipment.name,
                    updatedEquipment.serialNumber
                );
            }

            // Check if equipment was discontinued
            if (currentEquipment.status !== 'Discontinued' && updatedEquipment.status === 'Discontinued') {
                await createDiscontinuedNotification(
                    updatedEquipment._id,
                    updatedEquipment.name,
                    updatedEquipment.serialNumber
                );
            }
        }

        res.json(updatedEquipment);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE EQUIPMENT
router.delete('/:id', verify, async (req, res) => {
    try {
        await Equipment.findByIdAndDelete(req.params.id);
        res.json({ message: 'Equipment deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
