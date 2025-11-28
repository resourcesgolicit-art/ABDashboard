const mongoose = require('mongoose');

const WebinarSchema = new mongoose.Schema({
    courseId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Courses',
        required: true 
    },
    zoomWebinarId: { 
        type: String, 
        default: null 
    },
    title: { 
        type: String, 
        required: true 
    },
    scheduledAt: { 
        type: Date, 
        required: true 
    },
    durationMins: { 
        type: Number, 
        required: true,
        min: 1 // Duration should be at least 1 minute
    },
    joinUrl: { 
        type: String, 
        default: null 
    }, // stored encrypted if sensitive
    recordingUrl: { 
        type: String, 
        default: null 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    }
});

// Update updatedAt before saving
WebinarSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Index for efficient queries
WebinarSchema.index({ courseId: 1 });
WebinarSchema.index({ scheduledAt: 1 });
WebinarSchema.index({ createdAt: -1 });

const Webinar = mongoose.model('Webinar', WebinarSchema);
module.exports = Webinar;