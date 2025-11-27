const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
    orderId: { 
        type: Number, 
        required: true,
        index: true // For better query performance
    },
    courseId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Courses', // Reference to Course model
        required: true
    },
    unitPrice: { 
        type: Number, 
        required: true,
        min: 0 // Ensure price is not negative
    },
    quantity: { 
        type: Number, 
        default: 1,
        min: 1 // Ensure quantity is at least 1
    },
    totalPrice: {
        type: Number,
        default: 0 // Set default value instead of required
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

// Calculate total price before saving
OrderItemSchema.pre('save', function(next) {
    this.totalPrice = this.unitPrice * this.quantity;
    this.updatedAt = Date.now();
    next();
});

// Create compound index for better performance
OrderItemSchema.index({ orderId: 1, courseId: 1 });

// Virtual populate for order
OrderItemSchema.virtual('order', {
    ref: 'Order',
    localField: 'orderId',
    foreignField: 'id',
    justOne: true
});

// Ensure virtual fields are included when converting to JSON
OrderItemSchema.set('toJSON', { virtuals: true });
OrderItemSchema.set('toObject', { virtuals: true });

const OrderItem = mongoose.model('OrderItem', OrderItemSchema);
module.exports = OrderItem;