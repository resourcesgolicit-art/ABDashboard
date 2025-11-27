const mongoose = require('mongoose');

const TestimonialSchema = new mongoose.Schema({
    id: {
        type: Number,
        unique: true,
        // Note: In MongoDB, _id is used as primary key, but we can add a custom id field like your Prisma schema
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Can be null as in your Prisma schema
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    city: {
        type: String,
        required: false, // Optional field as in your Prisma schema
        trim: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    rating: {
        type: Number,
        required: false, // Optional field as in your Prisma schema
        min: 1,
        max: 5,
        validate: {
            validator: function(v) {
                return v === null || v === undefined || (Number.isInteger(v) && v >= 1 && v <= 5);
            },
            message: 'Rating must be an integer between 1 and 5'
        }
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

// Auto-increment for custom id field (similar to Prisma's @default(autoincrement()))
TestimonialSchema.pre('save', async function(next) {
    if (this.isNew && !this.id) {
        try {
            const lastTestimonial = await this.constructor.findOne().sort({ id: -1 });
            this.id = lastTestimonial ? lastTestimonial.id + 1 : 1;
        } catch (error) {
            return next(error);
        }
    }
    this.updatedAt = Date.now();
    next();
});

// Create indexes for better performance
TestimonialSchema.index({ userId: 1 });
TestimonialSchema.index({ rating: 1 });
TestimonialSchema.index({ createdAt: -1 }); // For recent testimonials query
TestimonialSchema.index({ name: 1 });

// Instance methods
TestimonialSchema.methods.toJSON = function() {
    const testimonial = this.toObject();
    // Remove mongoose internal fields if needed
    delete testimonial.__v;
    return testimonial;
};

// Static methods
TestimonialSchema.statics.findByRating = function(rating) {
    return this.find({ rating: rating });
};

TestimonialSchema.statics.findByUser = function(userId) {
    return this.find({ userId: userId });
};

TestimonialSchema.statics.getRecentTestimonials = function(limit = 10) {
    return this.find({})
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('userId', 'name email');
};

// Virtual populate for user details
TestimonialSchema.virtual('user', {
    ref: 'User',
    localField: 'userId',
    foreignField: '_id',
    justOne: true
});

// Ensure virtual fields are included when converting to JSON
TestimonialSchema.set('toJSON', { virtuals: true });
TestimonialSchema.set('toObject', { virtuals: true });

const Testimonial = mongoose.model('Testimonial', TestimonialSchema);
module.exports = Testimonial;