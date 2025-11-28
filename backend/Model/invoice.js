const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
    id: {
        type: Number,
        unique: true,
        // Auto-increment custom id field (similar to Prisma's autoincrement)
    },
    orderId: {
        type: Number,
        required: true,
        ref: 'Order' // Reference to Order model
    },
    fileUrl: {
        type: String,
        required: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Auto-increment for custom id field (similar to Prisma's autoincrement)
InvoiceSchema.pre('save', async function(next) {
    if (this.isNew && !this.id) {
        try {
            const lastInvoice = await this.constructor.findOne().sort({ id: -1 });
            this.id = lastInvoice ? lastInvoice.id + 1 : 1;
        } catch (error) {
            return next(error);
        }
    }
    next();
});

// Create indexes for better performance
InvoiceSchema.index({ orderId: 1 }, { unique: true }); // Unique index for orderId (one invoice per order)
InvoiceSchema.index({ createdAt: -1 }); // For recent invoices query

// Virtual populate for order details
InvoiceSchema.virtual('order', {
    ref: 'Order',
    localField: 'orderId',
    foreignField: 'id',
    justOne: true // Since it's a one-to-one relationship
});

// Ensure virtual fields are included when converting to JSON
InvoiceSchema.set('toJSON', { virtuals: true });
InvoiceSchema.set('toObject', { virtuals: true });

const Invoice = mongoose.model('Invoice', InvoiceSchema);
module.exports = Invoice;