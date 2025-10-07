const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const documentRoutes = require('./routes/documentRoutes');
const inquiryRoutes = require('./routes/inquiryRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const form137StubRoutes = require('./routes/form137StubRoutes');
const form138StubRoutes = require('./routes/form138StubRoutes');
const sectionRoutes = require('./routes/sectionRoutes');

// Load environment variables
dotenv.config();

// Debug: Print OpenAI API key to verify dotenv loading
console.log('Loaded OpenAI Key:', process.env.OPENAI_API_KEY);

const app = express();



// CORS configuration: allow frontend origin and credentials
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL, 'https://your-app.vercel.app'] // Replace with your actual Vercel domain
    : [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:5173',
        'http://127.0.0.1:5173'
      ],
  credentials: true
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight requests for all routes
app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/documentor', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes

app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/form137-stubs', form137StubRoutes);
app.use('/api/form138-stubs', form138StubRoutes);
app.use('/api/sections', sectionRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Documentor API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;

// Only start listening if not in serverless environment
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Export for Vercel serverless
module.exports = app; 