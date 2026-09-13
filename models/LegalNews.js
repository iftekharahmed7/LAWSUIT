const mongoose = require('mongoose');

const legalNewsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  summary: { type: String, required: true },
  category: {
    type: String,
    enum: ['labor', 'property', 'consumer', 'family', 'criminal', 'general'],
    default: 'general',
  },
  sourceUrl: { type: String },
  sourceName: { type: String },
  publishedDate: { type: Date, required: true },
}, { timestamps: true });

module.exports = mongoose.model('LegalNews', legalNewsSchema);
