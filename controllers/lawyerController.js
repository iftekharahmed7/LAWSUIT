const mongoose = require('mongoose');
const Lawyer = require('../models/Lawyer');

const serverError = (res, where, error) => {
  console.error(`[lawyers:${where}]`, error);
  return res.status(500).json({ message: 'Server error' });
};

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const addLawyer = async (req, res) => {
  try {
    // Whitelist fields instead of saving req.body wholesale.
    const { name, specialization, bio, experienceYears, location, contact, rating } = req.body;
    const newLawyer = new Lawyer({
      name,
      specialization,
      bio,
      experienceYears,
      location,
      contact: contact && typeof contact === 'object' ? { phone: contact.phone, email: contact.email } : undefined,
      rating,
    });
    await newLawyer.save();
    res.status(201).json({ message: 'Lawyer added successfully', lawyer: newLawyer });
  } catch (error) {
    if (error && error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Invalid lawyer data: ' + Object.keys(error.errors).join(', ') });
    }
    return serverError(res, 'add', error);
  }
};

const getAllLawyers = async (req, res) => {
  try {
    const lawyers = await Lawyer.find().sort({ rating: -1 });
    res.status(200).json(lawyers);
  } catch (error) {
    return serverError(res, 'all', error);
  }
};

const searchLawyers = async (req, res) => {
  try {
    const { specialization, location, name } = req.query;
    const filter = {};

    // Query params can arrive as arrays (?a=1&a=2); only plain strings are used,
    // and user text is escaped so it can never act as a regex.
    if (typeof specialization === 'string' && specialization) {
      filter.specialization = specialization.slice(0, 50);
    }
    if (typeof location === 'string' && location) {
      filter.location = { $regex: escapeRegex(location.slice(0, 100)), $options: 'i' };
    }
    if (typeof name === 'string' && name) {
      filter.name = { $regex: escapeRegex(name.slice(0, 100)), $options: 'i' };
    }

    const lawyers = await Lawyer.find(filter);
    res.status(200).json(lawyers);
  } catch (error) {
    return serverError(res, 'search', error);
  }
};

const getLawyerById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Lawyer not found' });
    }
    const lawyer = await Lawyer.findById(req.params.id);
    if (!lawyer) {
      return res.status(404).json({ message: 'Lawyer not found' });
    }
    res.status(200).json(lawyer);
  } catch (error) {
    return serverError(res, 'byId', error);
  }
};

module.exports = { addLawyer, getAllLawyers, searchLawyers, getLawyerById };
