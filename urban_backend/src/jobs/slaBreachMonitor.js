const cron = require('node-cron');
const Complaint = require('../models/Complaint');

// Run every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  try {
    const now = new Date();
    
    // Find breached complaints
    const breachedComplaints = await Complaint.find({
      status: { $in: ['pending', 'assigned', 'in-progress'] },
      slaExpiry: { $lt: now },
      slaBreachAlertSent: false
    });

    if (breachedComplaints.length > 0) {
      console.log(`🚨 SLA Breach Alert: ${breachedComplaints.length} complaints`);
      
      // Mark alerts as sent
      await Complaint.updateMany(
        { _id: { $in: breachedComplaints.map(c => c._id) } },
        { $set: { slaBreachAlertSent: true } }
      );
      
      // TODO: Send DM alert / Email notification
    }
  } catch (error) {
    console.error('SLA Monitor Error:', error);
  }
});

module.exports = { start: () => {} }; // Dummy export