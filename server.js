const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
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

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'LawSuite backend is running!',
    mongoConnected: mongoose.connection.readyState === 1,
    endpoints: [
      '/api/auth',
      '/api/lawyers',
      '/api/documents',
      '/api/glossary',
      '/api/bookings',
      '/api/chat'
    ]
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 LawSuite backend running on http://localhost:${PORT}`);
});
