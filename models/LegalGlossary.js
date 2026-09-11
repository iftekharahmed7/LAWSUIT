const mongoose = require('mongoose');

const legalGlossarySchema = new mongoose.Schema({
    term: {
        type: String,
        required: true,
        trim: true
    },

    slug: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },

    bengaliTerm: {
        type: String,
        trim: true
    },

    definition: {
        type: String,
        required: true,
        trim: true
    },

    bengaliDefinition: {
        type: String,
        trim: true
    },

    category: {
        type: String,
        required: true,
        trim: true
    },

    examples: [{
        type: String,
        trim: true
    }],

    relatedRights: [{
        type: String,
        trim: true
    }],

    source: {
        type: String,
        trim: true
    },

    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('LegalGlossary', legalGlossarySchema);