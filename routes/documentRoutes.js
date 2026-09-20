const express = require('express');
const router = express.Router();
const { addDocument, getAllDocuments, getDocumentById } = require('../controllers/documentController');
const { protect, requireRole } = require('../middleware/authMiddleware');

// Adding to the public document library is an admin-only action, same as
// lawyers/glossary/legal-news - it was previously wide open to anyone.
router.post('/', protect, requireRole('admin'), addDocument);
router.get('/', getAllDocuments);
router.get('/:id', getDocumentById);

module.exports = router;
