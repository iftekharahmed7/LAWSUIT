const mongoose = require('mongoose');

const lawyerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  specialization: {
    type: String,
    enum: ['family', 'property', 'criminal', 'labor', 'consumer', 'corporate', 'general'],
    required: true,
  },
  bio: {
    type: String,
  },
  experienceYears: {
    type: Number,
    default: 0,
  },
  location: {
    type: String,
  },
  contact: {
    phone: String,
    email: String,
  },
  rating: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

module.exports = mongoose.model('Lawyer', lawyerSchema);