const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

const apiRoutes = require('./routes');
const { apiLimiter } = require('./middlewares/rateLimitMiddleware');
const { notFoundHandler, errorHandler } = require('./middlewares/errorMiddleware');

const app = express();

// Security Headers dengan Helmet (Cross-Origin Resource Sharing disesuaikan untuk gambar static)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);

// CORS Config
app.use(
  cors({
    origin: process.env.APP_ORIGIN || 'http://localhost:5173',
    credentials: true,
  }),
);

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static Folder untuk file upload (Foto temuan fisik)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// General API Rate Limiting
app.use('/api', apiLimiter);

// API Routes
app.use('/api', apiRoutes);

// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
