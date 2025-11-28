const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  // BASIC USER DATA
  name: { type: String },
  email: { type: String, required: true, unique: true },

  // AUTH FIELDS
  passwordHash: { type: String, default: null }, // for normal signup
  provider: { type: String, enum: ['local', 'google'], default: 'local' },

  // GOOGLE PROFILE Picture
  picture: { type: String, default: null },

  // ROLE
  role: { type: String, enum: ['user', 'admin'], default: 'user' },

  // PROFILE SETUP FIELDS (NEW)
  fullName: { type: String, default: '' },
  phone: { type: String, default: '' },
  gender: { type: String, default: '' },
  city: { type: String, default: '' },
  state: { type: String, default: '' },
  profileImage: { type: String, default: '' },

  // MARK IF PROFILE IS COMPLETED
  profileCompleted: { type: Boolean, default: false },

  // PURCHASE HISTORY (used for access control)
  orders: { type: Array, default: [] },
  testimonials: { type: Array, default: [] },

  // COURSE PROGRESS (NEW)
  coursesProgress: {
    type: [
      {
        courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Courses' },
        topics: [
          {
            topicId: { type: mongoose.Schema.Types.ObjectId },
            percent: { type: Number, default: 0 }, // 0–100
            lastSeenAt: { type: Date },
            lastImageIndex: { type: Number, default: 0 }, // bookmark for page
          },
        ],
        updatedAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  },

  // NOTES TAKEN BY USER (NEW)
  notes: {
    type: [
      {
        courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Courses' },
        topicId: { type: mongoose.Schema.Types.ObjectId },
        imageIndex: { type: Number }, // page index
        note: { type: String }, // text user saved
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', UserSchema);
