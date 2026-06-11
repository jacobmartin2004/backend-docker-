const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Hello from Express + Docker + Jenkins!', version: '1.0.0' });
});

// Example API route
app.get('/api/items', (req, res) => {
  const items = [
    { id: 1, name: 'Item One' },
    { id: 2, name: 'Item Two' },
    { id: 3, name: 'Item Three' },
    { id: 4, name: 'Item Four' },
    { id: 5, name: 'Item Five' },
  ];
  res.json(items);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
// hi this is hrc
module.exports = app;
