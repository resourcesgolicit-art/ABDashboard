const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    id: {
        type: Number,
        unique: true,
        // Custom auto-increment id field similar to Prisma's autoincrement
    },
    gateway: {
        type: String,
        required: true,
        trim: true
    },
    gatewayPaymentId: {
        type: String,
        required: true,
        trim: true
    },
    orderId: {
        type: Number,
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0 // Amount in paise, must be non-negative
    },
    status: {
        type: String,
        required: true,
        enum: ['initiated', 'captured', 'failed', 'refunded'],
        default: 'initiated'
    },
    method: {
        type: String,
        required: false,
        enum: ['UPI', 'CARD', 'NETBANKING', 'WALLET', 'EMI', null],
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

// Auto-increment for custom id field (similar to Prisma's autoincrement)
PaymentSchema.pre('save', async function(next) {
    if (this.isNew && !this.id) {
        try {
            const lastPayment = await this.constructor.findOne().sort({ id: -1 });
            this.id = lastPayment ? lastPayment.id + 1 : 1;
        } catch (error) {
            return next(error);
        }
    }
    this.updatedAt = Date.now();
    next();
});

// Create indexes for better performance
PaymentSchema.index({ orderId: 1 });
PaymentSchema.index({ gatewayPaymentId: 1 }, { unique: true }); // Unique index for gateway payment ID
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ gateway: 1 });
PaymentSchema.index({ createdAt: -1 }); // For recent payments query

// Virtual populate for order (similar to Prisma's relation)
PaymentSchema.virtual('order', {
    ref: 'Order',
    localField: 'orderId',
    foreignField: 'id',
    justOne: true
});

// Ensure virtual fields are included when converting to JSON
PaymentSchema.set('toJSON', { virtuals: true });
PaymentSchema.set('toObject', { virtuals: true });

// Instance methods
PaymentSchema.methods.isSuccessful = function() {
    return this.status === 'captured';
};

PaymentSchema.methods.isFailed = function() {
    return this.status === 'failed';
};

PaymentSchema.methods.isPending = function() {
    return this.status === 'initiated';
};

PaymentSchema.methods.isRefunded = function() {
    return this.status === 'refunded';
};

// Static methods
PaymentSchema.statics.findByOrderId = function(orderId) {
    return this.find({ orderId }).sort({ createdAt: -1 });
};

PaymentSchema.statics.findByGatewayPaymentId = function(gatewayPaymentId) {
    return this.findOne({ gatewayPaymentId });
};

PaymentSchema.statics.findSuccessfulPayments = function() {
    return this.find({ status: 'captured' }).sort({ createdAt: -1 });
};

PaymentSchema.statics.findFailedPayments = function() {
    return this.find({ status: 'failed' }).sort({ createdAt: -1 });
};

const Payment = mongoose.model('Payment', PaymentSchema);
module.exports = Payment;