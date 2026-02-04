const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: {
        type: String,
        enum: ['user', 'bot'],
        required: true
    },
    text: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    // For tracking actions executed
    actionExecuted: {
        type: String,
        enum: ['complaint_filed', 'aqi_checked', 'tax_calculated', 'sos_triggered', 'none'],
        default: 'none'
    },
    actionData: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    }
});

const chatHistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userEmail: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    sessionId: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true,
        maxlength: 100
    },
    messages: [messageSchema],
    // For admin tracking
    hasActions: {
        type: Boolean,
        default: false
    },
    actionsCount: {
        type: Number,
        default: 0
    },
    lastActionType: {
        type: String,
        default: null
    },
    // Metadata
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    }
});

// Indexes for efficient querying
chatHistorySchema.index({ userId: 1, createdAt: -1 });
chatHistorySchema.index({ userEmail: 1 });
chatHistorySchema.index({ hasActions: 1 });

// Update timestamp on save
chatHistorySchema.pre('save', function (next) {
    this.updatedAt = new Date();

    // Count actions
    const actionsInMessages = this.messages.filter(m => m.actionExecuted !== 'none');
    this.actionsCount = actionsInMessages.length;
    this.hasActions = actionsInMessages.length > 0;

    if (actionsInMessages.length > 0) {
        this.lastActionType = actionsInMessages[actionsInMessages.length - 1].actionExecuted;
    }

    next();
});

module.exports = mongoose.model('ChatHistory', chatHistorySchema);
