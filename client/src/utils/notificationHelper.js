// Helper function to generate overdue notifications from equipment data
export const generateOverdueNotifications = (equipment) => {
    const now = new Date();
    const overdueEquipment = equipment.filter(e => {
        if (!e.nextCalibrationDate) return false;
        const nextDate = new Date(e.nextCalibrationDate);
        return nextDate < now && (e.status === 'Active' || e.status === 'Inactive');
    });

    return overdueEquipment.map(e => {
        const daysOverdue = Math.floor((now - new Date(e.nextCalibrationDate)) / (1000 * 60 * 60 * 24));
        return {
            type: 'overdue',
            message: `${e.name} (${e.serialNumber}) is ${daysOverdue} days overdue for calibration`,
            equipmentId: e._id,
            timestamp: now,
            read: false
        };
    });
};
