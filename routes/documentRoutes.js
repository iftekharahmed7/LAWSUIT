const express = require('express');
const router = express.Router();
const { addDocument, getAllDocuments, getDocumentById } = require('../controllers/documentController');

router.post('/', addDocument);
router.get('/', getAllDocuments);
router.get('/:id', getDocumentById);

module.exports = router;