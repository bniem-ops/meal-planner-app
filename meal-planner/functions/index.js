const functions = require('firebase-functions');
const fetch = require('node-fetch');

// Allowed origins - your GitHub Pages URL
const ALLOWED_ORIGINS = [
  'https://bniem-ops.github.io',
  'http://localhost:5173',  // local dev
  'http://localhost:4173',  // local preview
];

exports.fetchRecipeHtml = functions
  .runWith({ timeoutSeconds: 20, memory: '256MB' })
  .https.onRequest(async (req, res) => {

    // CORS headers
    const origin = req.headers.origin;
    if (ALLOWED_ORIGINS.includes(origin)) {
      res.set('Access-Control-Allow-Origin', origin);
    }
    res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }

    const url = req.query.url;

    if (!url) {
      res.status(400).json({ error: 'Missing url parameter' });
      return;
    }

    // Basic URL validation - must be http/https
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      res.status(400).json({ error: 'Invalid URL' });
      return;
    }

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate',
          'Cache-Control': 'no-cache',
        },
        timeout: 15000,
        follow: 5, // follow redirects
      });

      if (!response.ok) {
        res.status(response.status).json({
          error: `Site returned ${response.status}. It may block automated requests.`
        });
        return;
      }

      const html = await response.text();
      res.status(200).json({ html, url });

    } catch (err) {
      console.error('Fetch error:', err.message);
      res.status(500).json({
        error: 'Could not reach that site. It may be down or blocking requests.'
      });
    }
  });
