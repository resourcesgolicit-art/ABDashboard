const mongoose = require('mongoose');

// Each topic contains multiple images (pages)
const TopicSchema = new mongoose.Schema({
  title: { type: String, required: true },
  images: [{ type: String, required: true }], // image URLs (Cloudinary/S3)
});

// Main Course Schema
const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },

  description: { type: String, required: true },

  price: { type: Number, required: true }, // INR price
  originalPrice: { type: Number, default: null },

  isActive: { type: Boolean, default: true },

  topics: { type: [TopicSchema], default: [] }, // <--- IMPORTANT

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Update updatedAt time before saving
CourseSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Courses', CourseSchema);
