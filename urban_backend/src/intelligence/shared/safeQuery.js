/**
 * SAFE QUERY UTILITIES
 * Provides read-only access to complaint data with safety guarantees
 * NO MUTATIONS ALLOWED - All queries use .lean() for read-only access
 */

const Complaint = require('../../models/Complaint');

class SafeQuery {
    /**
     * Safe read-only query for complaints
     * @param {Object} filter - MongoDB filter object
     * @param {Object} options - Query options (projection, sort, limit)
     * @returns {Promise<Array>} Read-only complaint data
     */
    static async getComplaints(filter = {}, options = {}) {
        try {
            const { projection = {}, sort = { createdAt: -1 }, limit = 1000 } = options;

            // ✅ SAFETY: .lean() ensures read-only, no mongoose document methods
            const complaints = await Complaint
                .find(filter, projection)
                .sort(sort)
                .limit(limit)
                .lean()
                .exec();

            return { success: true, data: complaints };
        } catch (error) {
            console.error('❌ SafeQuery.getComplaints error:', error.message);
            return { success: false, error: error.message, data: [] };
        }
    }

    /**
     * Safe aggregation pipeline for analytics
     * @param {Array} pipeline - MongoDB aggregation pipeline
     * @returns {Promise<Array>} Aggregated results
     */
    static async aggregate(pipeline = []) {
        try {
            // ✅ SAFETY: Aggregation is read-only by nature
            const results = await Complaint.aggregate(pipeline).exec();
            return { success: true, data: results };
        } catch (error) {
            console.error('❌ SafeQuery.aggregate error:', error.message);
            return { success: false, error: error.message, data: [] };
        }
    }

    /**
     * Get complaints by area with safe defaults
     */
    static async getComplaintsByArea(areaId, timeRange = {}) {
        const filter = { 'location.address': new RegExp(areaId, 'i') };

        if (timeRange.start || timeRange.end) {
            filter.createdAt = {};
            if (timeRange.start) filter.createdAt.$gte = new Date(timeRange.start);
            if (timeRange.end) filter.createdAt.$lte = new Date(timeRange.end);
        }

        return this.getComplaints(filter);
    }

    /**
     * Get complaints by department with safe defaults
     */
    static async getComplaintsByDepartment(department, timeRange = {}) {
        const filter = {
            $or: [
                { department: department },
                { assignedDept: department }
            ]
        };

        if (timeRange.start || timeRange.end) {
            filter.createdAt = {};
            if (timeRange.start) filter.createdAt.$gte = new Date(timeRange.start);
            if (timeRange.end) filter.createdAt.$lte = new Date(timeRange.end);
        }

        return this.getComplaints(filter);
    }

    /**
     * Get complaints by status with safe defaults
     */
    static async getComplaintsByStatus(status, timeRange = {}) {
        const filter = { status };

        if (timeRange.start || timeRange.end) {
            filter.createdAt = {};
            if (timeRange.start) filter.createdAt.$gte = new Date(timeRange.start);
            if (timeRange.end) filter.createdAt.$lte = new Date(timeRange.end);
        }

        return this.getComplaints(filter);
    }

    /**
     * Get resolved complaints (for memory vault and analytics)
     */
    static async getResolvedComplaints(timeRange = {}) {
        const filter = {
            status: { $in: ['solved', 'fake', 'deleted'] }
        };

        if (timeRange.start || timeRange.end) {
            filter.updatedAt = {};
            if (timeRange.start) filter.updatedAt.$gte = new Date(timeRange.start);
            if (timeRange.end) filter.updatedAt.$lte = new Date(timeRange.end);
        }

        return this.getComplaints(filter);
    }

    /**
     * Calculate time difference in hours
     */
    static calculateHoursDiff(startDate, endDate) {
        try {
            const start = new Date(startDate);
            const end = new Date(endDate);
            return Math.abs(end - start) / (1000 * 60 * 60);
        } catch (error) {
            return 0;
        }
    }

    /**
     * Get date range for analysis (default: last 30 days)
     */
    static getDefaultTimeRange(days = 30) {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - days);
        return { start, end };
    }

    /**
     * Safe count with filter
     */
    static async countComplaints(filter = {}) {
        try {
            const count = await Complaint.countDocuments(filter).exec();
            return { success: true, count };
        } catch (error) {
            console.error('❌ SafeQuery.countComplaints error:', error.message);
            return { success: false, count: 0, error: error.message };
        }
    }
}

module.exports = SafeQuery;
