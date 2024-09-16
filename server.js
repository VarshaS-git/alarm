const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const pool = require('./db'); // PostgreSQL connection pool

const app = express();
const port = 3001;

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

// Store QR code in database
app.post('/store-qrcode', async (req, res) => {
  const { qrCode } = req.body;

  try {
    const query = 'INSERT INTO qrcodes (code, scanned_at) VALUES ($1, NOW()) RETURNING *';
    const result = await pool.query(query, [qrCode]);

    if (result.rows.length) {
      res.status(200).json({ message: 'QR code stored successfully!' });
    } else {
      res.status(500).json({ message: 'Failed to store QR code.' });
    }
  } catch (err) {
    console.error('Error storing QR code:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Set alarm
app.post('/set-alarm', async (req, res) => {
  const { hour, minute, qrCode } = req.body;

  try {
    const query = 'INSERT INTO alarms (hour, minute, code, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *';
    const result = await pool.query(query, [hour, minute, qrCode]);

    if (result.rows.length) {
      res.status(200).json({ message: 'Alarm set successfully!' });
    } else {
      res.status(500).json({ message: 'Failed to set alarm.' });
    }
  } catch (err) {
    console.error('Error setting alarm:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Serve the index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
