/**
 * BASE SERVICE CLASS
 * Foundation for all intelligence modules
 * Provides common utilities, error handling, and safe patterns
 */

const SafeQuery = require('./safeQuery');

class BaseService {
    constructor(moduleName) {
        this.moduleName = moduleName;
    }

    /**
     * Safe execution wrapper with comprehensive error handling
     * @param {Function} operation - Async operation to execute
     * @param {String} operationName - Name for logging
     * @returns {Promise<Object>} Result with success flag
     */
    async safeExecute(operation, operationName = 'operation') {
        try {
            console.log(`🔄 [${this.moduleName}] Starting ${operationName}...`);
            const result = await operation();
            console.log(`✅ [${this.moduleName}] ${operationName} completed successfully`);
            return { success: true, data: result };
        } catch (error) {
            console.error(`❌ [${this.moduleName}] ${operationName} failed:`, error.message);
            return {
                success: false,
                error: error.message,
                module: this.moduleName,
                operation: operationName
            };
        }
    }

    /**
     * Get safe query instance
     */
    getSafeQuery() {
        return SafeQuery;
    }

    /**
     * Calculate statistics from array of numbers
     */
    calculateStats(numbers = []) {
        if (!numbers || numbers.length === 0) {
            return { avg: 0, min: 0, max: 0, sum: 0, count: 0 };
        }

        const sum = numbers.reduce((a, b) => a + b, 0);
        const avg = sum / numbers.length;
        const min = Math.min(...numbers);
        const max = Math.max(...numbers);

        return { avg, min, max, sum, count: numbers.length };
    }

    /**
     * Calculate percentage safely
     */
    calculatePercentage(part, total) {
        if (!total || total === 0) return 0;
        return Math.round((part / total) * 100 * 100) / 100; // 2 decimal places
    }

    /**
     * Group data by key
     */
    groupBy(array, key) {
        return array.reduce((result, item) => {
            const groupKey = typeof key === 'function' ? key(item) : item[key];
            if (!result[groupKey]) {
                result[groupKey] = [];
            }
            result[groupKey].push(item);
            return result;
        }, {});
    }

    /**
     * Calculate moving average
     */
    calculateMovingAverage(data, windowSize = 7) {
        if (data.length < windowSize) return data;

        const result = [];
        for (let i = 0; i <= data.length - windowSize; i++) {
            const window = data.slice(i, i + windowSize);
            const avg = window.reduce((a, b) => a + b, 0) / windowSize;
            result.push(avg);
        }
        return result;
    }

    /**
     * Detect anomalies using standard deviation
     */
    detectAnomalies(data, threshold = 2) {
        if (data.length < 3) return [];

        const stats = this.calculateStats(data);
        const variance = data.reduce((sum, val) => sum + Math.pow(val - stats.avg, 2), 0) / data.length;
        const stdDev = Math.sqrt(variance);

        return data.map((value, index) => {
            const zScore = Math.abs((value - stats.avg) / stdDev);
            return {
                index,
                value,
                isAnomaly: zScore > threshold,
                zScore
            };
        }).filter(item => item.isAnomaly);
    }

    /**
     * Calculate trend (simple linear regression slope)
     */
    calculateTrend(data) {
        if (data.length < 2) return 0;

        const n = data.length;
        const indices = Array.from({ length: n }, (_, i) => i);

        const sumX = indices.reduce((a, b) => a + b, 0);
        const sumY = data.reduce((a, b) => a + b, 0);
        const sumXY = indices.reduce((sum, x, i) => sum + x * data[i], 0);
        const sumX2 = indices.reduce((sum, x) => sum + x * x, 0);

        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

        return slope;
    }

    /**
     * Format response consistently
     */
    formatResponse(success, data = null, message = '', metadata = {}) {
        const response = {
            success,
            module: this.moduleName,
            timestamp: new Date().toISOString()
        };

        if (message) response.message = message;
        if (data !== null) response.data = data;
        if (Object.keys(metadata).length > 0) response.metadata = metadata;

        return response;
    }

    /**
     * Validate date range
     */
    validateDateRange(startDate, endDate) {
        try {
            const start = new Date(startDate);
            const end = new Date(endDate);

            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                return { valid: false, error: 'Invalid date format' };
            }

            if (start > end) {
                return { valid: false, error: 'Start date must be before end date' };
            }

            return { valid: true, start, end };
        } catch (error) {
            return { valid: false, error: error.message };
        }
    }

    /**
     * Get time buckets for analysis
     */
    getTimeBuckets(startDate, endDate, bucketSize = 'day') {
        const buckets = [];
        const current = new Date(startDate);
        const end = new Date(endDate);

        while (current <= end) {
            buckets.push(new Date(current));

            switch (bucketSize) {
                case 'hour':
                    current.setHours(current.getHours() + 1);
                    break;
                case 'day':
                    current.setDate(current.getDate() + 1);
                    break;
                case 'week':
                    current.setDate(current.getDate() + 7);
                    break;
                case 'month':
                    current.setMonth(current.getMonth() + 1);
                    break;
                default:
                    current.setDate(current.getDate() + 1);
            }
        }

        return buckets;
    }

    /**
     * Calculate severity score (0-100)
     */
    calculateSeverity(value, thresholds = { low: 33, medium: 66 }) {
        if (value <= thresholds.low) return 'low';
        if (value <= thresholds.medium) return 'medium';
        return 'high';
    }

    /**
     * Log analytics event
     */
    logEvent(eventType, data = {}) {
        console.log(`📊 [${this.moduleName}] ${eventType}:`, JSON.stringify(data, null, 2));
    }
}

module.exports = BaseService;
