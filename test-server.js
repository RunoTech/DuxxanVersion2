const express = require('express');
const app = express();

// Simple test server
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>DUXXAN Test</title>
    </head>
    <body>
      <h1>DUXXAN Platform Test</h1>
      <p>Server is running on port 3000</p>
      <script>
        console.log('Test server loaded');
        // Test API connection
        fetch('/api/stats')
          .then(res => res.json())
          .then(data => console.log('API Response:', data))
          .catch(err => console.log('API Error:', err));
      </script>
    </body>
    </html>
  `);
});

// Proxy API requests to main server
app.use('/api', require('http-proxy-middleware').createProxyMiddleware({
  target: 'http://localhost:5000',
  changeOrigin: true
}));

app.listen(3000, () => {
  console.log('Test server running on port 3000');
});