const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['contract', 'affidavit', 'petition', 'agreement', 'notice', 'general'],
    default: 'general',
  },
  content: {
    type: String,
    required: true,
  },
  fileUrl: {
    type: String,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);