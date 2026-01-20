const complaintService = require('../utils/complaintService');
const { success, badRequest, internalError } = require('../utils/responseHandler');

// ✅ SUBMIT COMPLAINT
exports.submitComplaint = async (req, res) => {
  try {
    const complaint = await complaintService.submitComplaint(req.body);
    
    // Trigger AI analysis (non-blocking)
    process.nextTick(() => {
      complaintService.categorizeComplaint(complaint._id);
    });
    
    return success(res, complaint, 'Complaint submitted successfully');
  } catch (error) {
    if (error.message === 'MISSING_REQUIRED_FIELDS') {
      return badRequest(res, 'Title and user ID are required');
    }
    if (error.message === 'INVALID_LOCATION') {
      return badRequest(res, 'Valid location (lng, lat) is required');
    }
    return internalError(res);
  }
};

// ✅ GET ALL COMPLAINTS
exports.getComplaints = async (req, res) => {
  try {
    const complaints = await complaintService.getComplaints();
    return success(res, complaints);
  } catch (error) {
    return internalError(res);
  }
};

// ✅ UPDATE COMPLAINT STATUS
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const complaint = await complaintService.updateStatus(id, status);
    return success(res, complaint, 'Status updated successfully');
  } catch (error) {
    if (error.message === 'INVALID_STATUS') {
      return badRequest(res, 'Invalid status. Use: working, solved, or fake');
    }
    if (error.message === 'COMPLAINT_NOT_FOUND') {
      return badRequest(res, 'Complaint not found');
    }
    return internalError(res);
  }
};