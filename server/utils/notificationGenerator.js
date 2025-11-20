const Equipment = require('../models/Equipment');
const Notification = require('../models/Notification');

// Generate notifications for overdue equipment
const generateOverdueNotifications = async () => {
    try {
        const now = new Date();
        const overdueEquipment = await Equipment.find({
            nextCalibrationDate: { $lt: now },
            status: { $in: ['Active', 'Inactive'] }
        });

        const notifications = [];
        for (const equipment of overdueEquipment) {
            // Check if notification already exists for this equipment
            const existingNotification = await Notification.findOne({
                equipment: equipment._id,
                type: 'overdue',
                read: false
            });

            if (!existingNotification) {
                const daysOverdue = Math.floor((now - new Date(equipment.nextCalibrationDate)) / (1000 * 60 * 60 * 24));
                notifications.push({
                    type: 'overdue',
                    message: `${equipment.name} (${equipment.serialNumber}) is ${daysOverdue} days overdue for calibration`,
                    equipment: equipment._id
                });
            }
        }

        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
        }

        return notifications.length;
    } catch (err) {
        console.error('Error generating overdue notifications:', err);
        return 0;
    }
};

// Create notification when equipment returns from calibration
const createReturnNotification = async (equipmentId, equipmentName, serialNumber) => {
    try {
        await Notification.create({
            type: 'return',
            message: `${equipmentName} (${serialNumber}) has returned from calibration`,
            equipment: equipmentId
        });
    } catch (err) {
        console.error('Error creating return notification:', err);
    }
};

// Create notification when equipment is discontinued
const createDiscontinuedNotification = async (equipmentId, equipmentName, serialNumber) => {
    try {
        await Notification.create({
            type: 'discontinued',
            message: `${equipmentName} (${serialNumber}) has been marked as discontinued`,
            equipment: equipmentId
        });
    } catch (err) {
        console.error('Error creating discontinued notification:', err);
    }
};

module.exports = {
    generateOverdueNotifications,
    createReturnNotification,
    createDiscontinuedNotification
};
