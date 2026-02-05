const Notification = require('../models/Notification');
const Admin = require('../models/Admin');

/**
 * Unified Notification Helper
 * @param {string} recipientId - User ID or 'admin'
 * @param {string} title - Title of notification
 * @param {string} message - Content
 * @param {string} type - 'complaint', 'sos', 'system'
 * @param {object} app - Express app instance to access socketio
 */
const sendNotification = async (recipientId, title, message, type, app) => {
    try {
        const io = app.get('socketio');

        let recipients = [];
        if (recipientId === 'admin') {
            // Get all admins to notify
            const admins = await Admin.find().select('_id');
            recipients = admins.map(a => a._id.toString());
        } else {
            recipients = [recipientId.toString()];
        }

        for (const targetId of recipients) {
            // 1. Save to Database
            const notif = new Notification({
                recipient: targetId,
                title,
                message,
                type: type || 'system'
            });
            await notif.save();

            // 2. Emit via Socket.io
            if (io) {
                console.log(`🔔 Emitting notification to room: ${targetId}`);
                io.to(targetId).emit('notification', {
                    _id: notif._id,
                    title,
                    message,
                    type,
                    createdAt: notif.createdAt
                });
            }
        }

        return { success: true };
    } catch (error) {
        console.error('❌ Notification Service Error:', error.message);
        return { success: false, error: error.message };
    }
};

module.exports = { sendNotification };
