const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    category: { type: String, enum: ['Infrastructure', 'Health', 'Education', 'Sanitation', 'Transport'], required: true },
    location: {
        city: { type: String, default: 'Haldwani' },
        state: { type: String, default: 'Uttarakhand' },
        lat: Number,
        lng: Number,
        address: String
    },
    financials: {
        allocated: { type: Number, required: true },
        spent: { type: Number, default: 0 },
        contractor: String
    },
    status: { type: String, enum: ['Planned', 'In-Progress', 'Completed', 'Halted'], default: 'Planned' },
    progress: { type: Number, default: 0 }, // 0 to 100
    dates: {
        start: Date,
        end: Date
    },
    images: [String],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Project', projectSchema);
