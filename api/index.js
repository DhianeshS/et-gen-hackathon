const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
const chatRoute = require('./chat');
const historyRoute = require('./history');

app.use('/api/chat', chatRoute);
app.use('/api/history', historyRoute);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'FinMentor API is running' });
});

// Start standard Express test server on local
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Express server running on port ${PORT}`);
  });
}

// Export for Vercel Serverless
module.exports = app;
