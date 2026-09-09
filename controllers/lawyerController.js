const Lawyer = require('../models/Lawyer');

const addLawyer = async (req, res) => {
  try {
    const newLawyer = new Lawyer(req.body);
    await newLawyer.save();
    res.status(201).json({ message: 'Lawyer added successfully', lawyer: newLawyer });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAllLawyers = async (req, res) => {
  try {
    const lawyers = await Lawyer.find().sort({ rating: -1 });
    res.status(200).json(lawyers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const searchLawyers = async (req, res) => {
  try {
    const { specialization, location, name } = req.query;
    const filter = {};

    if (specialization) filter.specialization = specialization;
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (name) filter.name = { $regex: name, $options: 'i' };

    const lawyers = await Lawyer.find(filter);
    res.status(200).json(lawyers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getLawyerById = async (req, res) => {
  try {
    const lawyer = await Lawyer.findById(req.params.id);
    if (!lawyer) {
      return res.status(404).json({ message: 'Lawyer not found' });
    }
    res.status(200).json(lawyer);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { addLawyer, getAllLawyers, searchLawyers, getLawyerById };