const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.set('trust proxy', 1);
app.use(cors());
app.use(express.json());

const mongoose = require('mongoose');

// Connect to MongoDB if MONGO_URI is configured
const mongoUri = process.env.MONGO_URI;
if (mongoUri) {
  mongoose
    .connect(mongoUri)
    .then(() => console.log('✓ MongoDB connected successfully!'))
    .catch((err) => console.error('✗ MongoDB connection error:', err.message));
} else {
  console.warn('⚠️  Warning: MONGO_URI is not set in .env. Database features will be unavailable until configured.');
}

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const glossaryRoutes = require('./routes/glossaryRoutes');
app.use('/api/glossary', glossaryRoutes);

const lawyerRoutes = require('./routes/lawyerRoutes');
app.use('/api/lawyers', lawyerRoutes);

const documentRoutes = require('./routes/documentRoutes');
app.use('/api/documents', documentRoutes);

const bookingRoutes = require('./routes/bookingRoutes');
app.use('/api/bookings', bookingRoutes);

const chatRoutes = require('./routes/chatRoutes');
app.use('/api/chat', chatRoutes);

const legalNewsRoutes = require('./routes/legalNewsRoutes');
app.use('/api/legal-news', legalNewsRoutes);

const summarizeRoutes = require('./routes/summarizeRoutes');
app.use('/api/summarize', summarizeRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'LawSuite backend is running!',
    mongoConnected: mongoose.connection.readyState === 1,
    endpoints: ['/api/auth', '/api/lawyers', '/api/documents', '/api/glossary', '/api/bookings', '/api/chat']
  });
});

// Serve the built frontend from this same server - this is what makes the
// whole site reachable from ONE url with zero CORS setup, since the page
// and its API calls are same-origin. Must stay AFTER the /api/... routes.
const path = require('path');
app.use(express.static(path.join(__dirname, 'FRONTEND', 'dist')));
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'FRONTEND', 'dist', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 LawSuite backend running on http://localhost:${PORT}`);
});
