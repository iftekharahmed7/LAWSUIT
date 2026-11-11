const mongoose = require('mongoose');
const Lawyer = require('../models/Lawyer');
const Booking = require('../models/Booking');
const Document = require('../models/Document');
const GlossaryTerm = require('../models/GlossaryTerm');
const LegalNews = require('../models/LegalNews');

// Builds the admin "edit" and "delete" handlers for one kind of content.
// Only the listed fields can be changed, so a request can never overwrite
// anything else on the record.
function makeEditor(Model, label, fields, options = {}) {
  const notFound = (res) => res.status(404).json({ message: `${label} not found` });

  const update = async (req, res) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) return notFound(res);
      const record = await Model.findById(req.params.id);
      if (!record) return notFound(res);

      const body = req.body && typeof req.body === 'object' ? req.body : {};
      for (const field of fields) {
        const value = body[field];
        if (value === undefined) continue;
        if (field === 'contact') {
          if (value && typeof value === 'object' && !Array.isArray(value)) {
            record.contact = { phone: value.phone, email: value.email };
          }
          continue;
        }
        if (value !== null && typeof value === 'object') {
          return res.status(400).json({ message: `Invalid value for ${field}` });
        }
        record[field] = value;
      }

      await record.save(); // runs the schema validation
      res.status(200).json({ message: `${label} updated`, item: record });
    } catch (error) {
      if (error && (error.name === 'ValidationError' || error.name === 'CastError')) {
        const where = error.errors ? Object.keys(error.errors).join(', ') : error.path;
        return res.status(400).json({ message: `Invalid ${label.toLowerCase()} data: ${where}` });
      }
      if (error && error.code === 11000) {
        return res.status(400).json({ message: `Another ${label.toLowerCase()} already uses that value` });
      }
      console.error(`[admin:update ${label}]`, error);
      return res.status(500).json({ message: 'Server error' });
    }
  };

  const remove = async (req, res) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) return notFound(res);
      const record = await Model.findById(req.params.id);
      if (!record) return notFound(res);

      if (options.blockDelete) {
        const reason = await options.blockDelete(record);
        if (reason) return res.status(409).json({ message: reason });
      }

      await record.deleteOne();
      res.status(200).json({ message: `${label} deleted` });
    } catch (error) {
      console.error(`[admin:delete ${label}]`, error);
      return res.status(500).json({ message: 'Server error' });
    }
  };

  return { update, remove };
}

const lawyers = makeEditor(
  Lawyer,
  'Lawyer',
  ['name', 'specialization', 'bio', 'experienceYears', 'location', 'rating', 'contact'],
  {
    // Clients with a live booking must not be left pointing at nothing.
    blockDelete: async (lawyer) => {
      const active = await Booking.countDocuments({
        lawyer: lawyer._id,
        status: { $in: ['pending', 'confirmed'] },
      });
      return active > 0
        ? `This lawyer has ${active} active booking(s). Cancel or complete them first.`
        : null;
    },
  }
);

const documents = makeEditor(Document, 'Document', ['title', 'category', 'content', 'fileUrl']);
const glossary = makeEditor(GlossaryTerm, 'Glossary term', ['term', 'definition', 'category']);
const news = makeEditor(LegalNews, 'News item', [
  'title', 'summary', 'category', 'sourceUrl', 'sourceName', 'publishedDate',
]);

module.exports = { lawyers, documents, glossary, news };
