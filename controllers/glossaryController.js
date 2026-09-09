const GlossaryTerm = require('../models/GlossaryTerm');

const addTerm = async (req, res) => {
  try {
    const { term, definition, category } = req.body;

    const existingTerm = await GlossaryTerm.findOne({ term });
    if (existingTerm) {
      return res.status(400).json({ message: 'This term already exists' });
    }

    const newTerm = new GlossaryTerm({ term, definition, category });
    await newTerm.save();

    res.status(201).json({ message: 'Term added successfully', term: newTerm });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAllTerms = async (req, res) => {
  try {
    const terms = await GlossaryTerm.find().sort({ term: 1 });
    res.status(200).json(terms);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const searchTerms = async (req, res) => {
  try {
    const { q } = req.query;
    const terms = await GlossaryTerm.find({
      term: { $regex: q, $options: 'i' },
    });
    res.status(200).json(terms);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { addTerm, getAllTerms, searchTerms };