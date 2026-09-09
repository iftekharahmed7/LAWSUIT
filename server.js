const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected!'))
  .catch((err) => console.log('MongoDB connection error:', err));

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

app.get('/', (req, res) => {
  res.send('LawSuite backend is running!');
});

app.listen(5000, () => console.log('Server running on port 5000'));