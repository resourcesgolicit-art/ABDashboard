const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema({
    id: { type: Number, unique: true }, // This will be auto-generated
    code: { type: String, required: true, unique: true, uppercase: true },
    discountType: { 
        type: String, 
        required: true,
        enum: ['percentage', 'fixed'],
        lowercase: true
    },
    discountValue: { type: Number, required: true, min: 0 },
    validFrom: { type: Date, required: true },
    validTill: { type: Date, required: true },
    usageLimit: { type: Number, default: null, min: 0 }, // null means unlimited
    usedCount: { type: Number, default: 0, min: 0 }, // Track how many times it's been used
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Auto-increment id field
CouponSchema.pre('save', async function(next) {
    this.updatedAt = Date.now();
    
    if (this.isNew && !this.id) {
        try {
            const lastCoupon = await this.constructor.findOne({}, {}, { sort: { 'id': -1 } });
            this.id = lastCoupon ? lastCoupon.id + 1 : 1;
        } catch (error) {
            return next(error);
        }
    }
    
    // Validate date range
    if (this.validFrom >= this.validTill) {
        return next(new Error('validTill must be after validFrom'));
    }
    
    // Validate discount value based on type
    if (this.discountType === 'percentage' && this.discountValue > 100) {
        return next(new Error('Percentage discount cannot be more than 100%'));
    }
    
    next();
});

// Instance method to check if coupon is valid
CouponSchema.methods.isValid = function() {
    const now = new Date();
    return this.isActive && 
           now >= this.validFrom && 
           now <= this.validTill &&
           (this.usageLimit === null || this.usedCount < this.usageLimit);
};

// Instance method to check if coupon can be used
CouponSchema.methods.canBeUsed = function() {
    return this.isValid();
};

// Instance method to use coupon (increment usage count)
CouponSchema.methods.use = async function() {
    if (!this.canBeUsed()) {
        throw new Error('Coupon cannot be used');
    }
    
    this.usedCount += 1;
    return await this.save();
};

// Instance method to calculate discount amount
CouponSchema.methods.calculateDiscount = function(totalAmount) {
    if (!this.isValid()) {
        return 0;
    }
    
    if (this.discountType === 'percentage') {
        return Math.round((totalAmount * this.discountValue) / 100);
    } else if (this.discountType === 'fixed') {
        return Math.min(this.discountValue, totalAmount);
    }
    
    return 0;
};

// Static method to find valid coupon by code
CouponSchema.statics.findValidCoupon = function(code) {
    const now = new Date();
    return this.findOne({
        code: code.toUpperCase(),
        isActive: true,
        validFrom: { $lte: now },
        validTill: { $gte: now },
        $or: [
            { usageLimit: null },
            { $expr: { $lt: ['$usedCount', '$usageLimit'] } }
        ]
    });
};

const Coupon = mongoose.model('Coupon', CouponSchema);
module.exports = Coupon;