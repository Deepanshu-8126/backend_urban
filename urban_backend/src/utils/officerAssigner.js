const Officer = require('../models/Officer');
const Complaint = require('../models/Complaint');

exports.assignOfficerToComplaint = async (complaintId) => {
  try {
    const complaint = await Complaint.findById(complaintId);
    if (!complaint || complaint.status !== 'assigned') return;

    const { department, location } = complaint;
    const [lng, lat] = location.coordinates;

    // Find available officers in same department with lowest workload
    const officers = await Officer.find({
      department,
      status: 'available',
      currentWorkload: { $lt: '$maxCapacity' }
    }).sort({ currentWorkload: 1 });

    if (officers.length === 0) {
      // No available officers - assign to general pool
      await Complaint.findByIdAndUpdate(complaintId, {
        assignedOfficer: 'general-pool',
        status: 'pending'
      });
      return;
    }

    // Assign to officer with least workload
    const assignedOfficer = officers[0];
    
    // Update officer workload
    await Officer.findByIdAndUpdate(assignedOfficer._id, {
      $inc: { currentWorkload: 1 }
    });

    // Update complaint
    await Complaint.findByIdAndUpdate(complaintId, {
      assignedOfficer: assignedOfficer._id.toString(),
      status: 'in-progress'
    });

    return {
      success: true,
      officerId: assignedOfficer._id,
      complaintId
    };

  } catch (error) {
    console.error('Officer Assignment Error:', error);
    return { success: false, error: error.message };
  }
};