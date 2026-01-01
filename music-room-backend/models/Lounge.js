const mongoose = require('mongoose');

const loungeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  maxMembers: {
    type: Number,
    default: 50
  }
}, {
  timestamps: true
});

// Index for faster code lookups
loungeSchema.index({ code: 1 });

module.exports = mongoose.model('Lounge', loungeSchema);