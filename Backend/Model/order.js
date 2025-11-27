const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    id: {
        type: Number,
        unique: true,
        // Note: In MongoDB, _id is used as primary key, but we can add a custom id field
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Can be null for guest orders
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: false,
        trim: true
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0 // Amount in paise, must be non-negative
    },
    currency: {
        type: String,
        default: 'INR',
        enum: ['INR', 'USD', 'EUR'] // Add more currencies as needed
    },
    status: {
        type: String,
        required: true,
        enum: ['created', 'pending_payment', 'paid', 'failed', 'refunded'],
        default: 'created'
    },
    couponId: {
        type: Number,
        required: false // Can be null if no coupon applied
    },
    paymentId: {
        type: Number,
        required: false // Can be null if payment not yet processed
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

// Auto-increment for custom id field (similar to Prisma's autoincrement)
OrderSchema.pre('save', async function(next) {
    if (this.isNew && !this.id) {
        try {
            const lastOrder = await this.constructor.findOne().sort({ id: -1 });
            this.id = lastOrder ? lastOrder.id + 1 : 1;
        } catch (error) {
            return next(error);
        }
    }
    this.updatedAt = Date.now();
    next();
});

// Create indexes for better performance (remove duplicate id index since it's handled in pre-save)
OrderSchema.index({ userId: 1 });
OrderSchema.index({ email: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 }); // For recent orders query

// Virtual populate for orderItems (similar to Prisma's relation)
OrderSchema.virtual('orderItems', {
    ref: 'OrderItem',
    localField: 'id',
    foreignField: 'orderId'
});

// Ensure virtual fields are included when converting to JSON
OrderSchema.set('toJSON', { virtuals: true });
OrderSchema.set('toObject', { virtuals: true });

const Order = mongoose.model('Order', OrderSchema);
module.exports = Order;