const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

const apiRoutes = require('./routes');
const { apiLimiter } = require('./middlewares/rateLimitMiddleware');
const { notFoundHandler, errorHandler } = require('./middlewares/errorMiddleware');

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);

const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,https://localhost:5173').split(',').map(s => s.trim());

app.use(
  cors({
    origin: (origin, callback) => {

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); 
      }
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api', apiLimiter);

app.use('/api', apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
