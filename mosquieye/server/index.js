//require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./db.js');
const userRoutes = require('./routes/user');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet()); // Security headers
app.use(morgan('dev')); // Request logging
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// API Routes
app.use('/api/users', userRoutes);

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.status || 500;
  const message = err.message || 'Something went wrong!';
  
  res.status(status).json({
    status: 'error',
    statusCode: status,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.info('SIGTERM signal received');
  process.exit(0);
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = server;