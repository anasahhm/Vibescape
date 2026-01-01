const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  loungeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lounge',
    required: true
  },
  spotifyId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  artist: {
    type: String,
    required: true
  },
  album: {
    type: String,
    required: true
  },
  albumArt: {
    type: String,
    default: ''
  },
  duration: {
    type: Number, // in milliseconds
    required: true
  },
  previewUrl: {
    type: String,
    default: ''
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  votes: {
    type: Number,
    default: 0
  },
  voters: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    vote: {
      type: Number,
      enum: [-1, 1] // -1 for downvote, 1 for upvote
    }
  }],
  isPlayed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Compound index for lounge queries
songSchema.index({ loungeId: 1, votes: -1 });

module.exports = mongoose.model('Song', songSchema);