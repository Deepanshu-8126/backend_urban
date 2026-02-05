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
const sendNotification = async (recipientId, title, message, type, app, department = null) => {
    try {
        const io = app.get('socketio');

        let recipients = [];
        if (recipientId === 'admin') {
            // Get admins to notify
            let query = {};
            if (department) {
                // If department is provided, notify only admins of that department
                query.department = department;
            }

            const admins = await Admin.find(query).select('_id');
            recipients = admins.map(a => a._id.toString());

            // If no department-specific admins found, fallback to all admins or a general pool
            if (recipients.length === 0 && department) {
                console.log(`⚠️ No admins found for department: ${department}. Notifying all admins instead.`);
                const allAdmins = await Admin.find().select('_id');
                recipients = allAdmins.map(a => a._id.toString());
            }
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
                // Determine room to emit to
                // If it was an admin notification and we have a department, 
                // we should probably emit to the department room once, 
                // but the current service loop is per-admin-id.
                // Let's stick to per-admin-id for individual badges, 
                // but we could also broadcast to admin_${department}

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

        // Optional: Broadcast to department room for instant global admin UI update if needed
        if (recipientId === 'admin' && department && io) {
            io.to(`admin_${department}`).emit('department_alert', { title, message, type });
        }

        return { success: true };
    } catch (error) {
        console.error('❌ Notification Service Error:', error.message);
        return { success: false, error: error.message };
    }
};

module.exports = { sendNotification };
