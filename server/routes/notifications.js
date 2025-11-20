const router = require('express').Router();
const Notification = require('../models/Notification');
const verify = require('../middleware/auth');

// GET ALL NOTIFICATIONS
router.get('/', verify, async (req, res) => {
    try {
        const notifications = await Notification.find()
            .populate('equipment', 'name serialNumber')
            .sort({ createdAt: -1 });
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// MARK NOTIFICATION AS READ
router.put('/:id/read', verify, async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { read: true },
            { new: true }
        );
        res.json(notification);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE NOTIFICATION
router.delete('/:id', verify, async (req, res) => {
    try {
        await Notification.findByIdAndDelete(req.params.id);
        res.json({ message: 'Notification deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// MARK ALL AS READ
router.put('/read-all', verify, async (req, res) => {
    try {
        await Notification.updateMany({ read: false }, { read: true });
        res.json({ message: 'All notifications marked as read' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
