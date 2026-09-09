const Document = require('../models/Document');

const addDocument = async (req, res) => {
  try {
    const { title, category, content, fileUrl } = req.body;
    const uploadedBy = req.user?.id;

    const newDoc = new Document({ title, category, content, fileUrl, uploadedBy });
    await newDoc.save();

    res.status(201).json({ message: 'Document added successfully', document: newDoc });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAllDocuments = async (req, res) => {
  try {
    const documents = await Document.find().sort({ createdAt: -1 });
    res.status(200).json(documents);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getDocumentById = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    res.status(200).json(document);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { addDocument, getAllDocuments, getDocumentById };