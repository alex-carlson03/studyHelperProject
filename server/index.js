// Entry point for the Study Helper backend.
// Loads env vars, wires up middleware, and mounts the API routes.
// .env lives at the repo root, one level up from this server/ folder.
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');

const uploadRoute = require('./routes/upload');
const generateRoute = require('./routes/generate');

const app = express();

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:3000")
  .split(',')
  .map(o => o.trim());

const corsOptions = {
  origin: allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins,
  methods: ["GET", "POST"],
};

app.use(cors(corsOptions));
// Parse JSON request bodies (used by /api/generate).
app.use(express.json({ limit: '1mb' }));

// Simple health check so you can confirm the server is up.
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api', uploadRoute);
app.use('/api', generateRoute);

// Use SERVER_PORT (not PORT) so it doesn't clash with react-scripts, which
// reads PORT from the same root .env and would try to use the same port.
const port = process.env.PORT || process.env.SERVER_PORT || 5000;
app.listen(port, () => {
  console.log(`Study Helper backend running on http://localhost:${port}`);
});
