//models/Note.js
const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true
  },
  content: { 
    type: String, 
    required: true 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  embedding: { 
    type: [Number], 
    default: [] 
  }, // For semantic search
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Text index for keyword search
noteSchema.index({ title: 'text', content: 'text' });

// Update updatedAt before saving
noteSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Note', noteSchema);