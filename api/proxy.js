const axios = require('axios');

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');

    if (req.method !== 'GET') {
        res.status(405).send('Method Not Allowed');
        return;
    }

    const { url } = req.query;
    if (!url) {
        res.status(400).send('Missing URL parameter');
        return;
    }

    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 10000 // 10s timeout
        });

        res.setHeader('Content-Type', response.headers['content-type'] || 'text/html');
        res.status(200).send(response.data);
    } catch (error) {
        console.error('Proxy error:', error.message);
        res.status(500).send(`Error fetching content: ${error.message}`);
    }
};