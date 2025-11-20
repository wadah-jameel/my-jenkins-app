const express = require('express');
const app = express();
const port = process.env.PORT || 3001;

app.get('/', (req, res) => {
  res.json({ message: '*** Hello Jenkins CI/CD! ***', timestamp: new Date().toISOString() });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = server;
