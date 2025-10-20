const axios = require('axios');

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method !== 'GET') {
        console.error('Invalid method:', req.method);
        res.status(405).send('Method Not Allowed');
        return;
    }

    const { url } = req.query;
    if (!url) {
        console.error('Missing URL parameter');
        res.status(400).send('Missing URL parameter');
        return;
    }

    // Validate and sanitize URL
    if (!url.match(/^https?:\/\//i)) {
        console.error('Invalid URL format:', url);
        res.status(400).send('Invalid URL format');
        return;
    }

    try {
        console.log('Proxy request for URL:', url);
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
            },
            timeout: 10000 // 10s timeout
        });

        console.log('Proxy success for URL:', url);
        res.setHeader('Content-Type', response.headers['content-type'] || 'text/html');
        res.status(200).send(response.data);
    } catch (error) {
        console.error('Proxy error for URL:', url, 'Error:', error.message, error.response?.status);
        res.status(error.response?.status || 500).send(`Error fetching content: ${error.message}`);
    }
};
