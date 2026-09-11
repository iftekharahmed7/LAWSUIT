const express = require('express');
const router = express.Router();
const { addDocument, getAllDocuments, getDocumentById } = require('../controllers/documentController');
const { attachUserIfPresent } = require('../middleware/authMiddleware');

router.post('/', attachUserIfPresent, addDocument);
router.get('/', getAllDocuments);
router.get('/:id', getDocumentById);

module.exports = router;
