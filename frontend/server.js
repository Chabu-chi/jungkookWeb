// frontend/server.js
import express from 'express';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const __dirname = path.resolve();

const PORT = process.env.PORT || 3000;

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// Catch-all route to send index.html for unknown paths
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🌐 Frontend running on http://localhost:${PORT}`);
});
