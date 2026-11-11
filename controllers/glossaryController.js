const GlossaryTerm = require('../models/GlossaryTerm');

const serverError = (res, where, error) => {
  console.error(`[glossary:${where}]`, error);
  return res.status(500).json({ message: 'Server error' });
};

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const addTerm = async (req, res) => {
  try {
    const { term, definition, category } = req.body;

    if (typeof term !== 'string' || !term.trim()) {
      return res.status(400).json({ message: 'A term is required.' });
    }
    const cleanTerm = term.trim();

    const existingTerm = await GlossaryTerm.findOne({ term: cleanTerm });
    if (existingTerm) {
      return res.status(400).json({ message: 'This term already exists' });
    }

    const newTerm = new GlossaryTerm({ term: cleanTerm, definition, category });
    await newTerm.save();

    res.status(201).json({ message: 'Term added successfully', term: newTerm });
  } catch (error) {
    if (error && error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Invalid term data: ' + Object.keys(error.errors).join(', ') });
    }
    if (error && error.code === 11000) {
      return res.status(400).json({ message: 'This term already exists' });
    }
    return serverError(res, 'add', error);
  }
};

const getAllTerms = async (req, res) => {
  try {
    const terms = await GlossaryTerm.find().sort({ term: 1 });
    res.status(200).json(terms);
  } catch (error) {
    return serverError(res, 'all', error);
  }
};

const searchTerms = async (req, res) => {
  try {
    const { q } = req.query;
    // Only plain strings are used, and user text is escaped so it can never
    // act as a regex (same approach as the lawyer search).
    const filter =
      typeof q === 'string' && q.trim()
        ? { term: { $regex: escapeRegex(q.trim().slice(0, 100)), $options: 'i' } }
        : {};
    const terms = await GlossaryTerm.find(filter).sort({ term: 1 });
    res.status(200).json(terms);
  } catch (error) {
    return serverError(res, 'search', error);
  }
};

module.exports = { addTerm, getAllTerms, searchTerms };
