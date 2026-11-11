const mongoose = require('mongoose');
const Document = require('../models/Document');

const serverError = (res, where, error) => {
  console.error(`[documents:${where}]`, error);
  return res.status(500).json({ message: 'Server error' });
};

const addDocument = async (req, res) => {
  try {
    const { title, category, content, fileUrl } = req.body;
    const uploadedBy = req.user?.id;

    const newDoc = new Document({ title, category, content, fileUrl, uploadedBy });
    await newDoc.save();

    res.status(201).json({ message: 'Document added successfully', document: newDoc });
  } catch (error) {
    if (error && error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Invalid document data: ' + Object.keys(error.errors).join(', ') });
    }
    return serverError(res, 'add', error);
  }
};

const getAllDocuments = async (req, res) => {
  try {
    const documents = await Document.find().sort({ createdAt: -1 });
    res.status(200).json(documents);
  } catch (error) {
    return serverError(res, 'all', error);
  }
};

const getDocumentById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Document not found' });
    }
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    res.status(200).json(document);
  } catch (error) {
    return serverError(res, 'byId', error);
  }
};

module.exports = { addDocument, getAllDocuments, getDocumentById };
