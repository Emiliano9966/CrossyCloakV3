export default async function handler(req, res) {
  try {
    let targetUrl = req.query.url;
    if (!targetUrl) {
      return res.status(400).send('Missing url parameter');
    }

    // Ensure full URL format
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = 'https://' + targetUrl;
    }

    const response = await fetch(targetUrl, {
      redirect: 'follow',
      headers: {
        'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
    });

    // If response redirects, follow manually
    if (response.status >= 300 && response.status < 400 && response.headers.get('location')) {
      const redirectUrl = new URL(response.headers.get('location'), targetUrl).href;
      return res.redirect(`/api/proxy?url=${encodeURIComponent(redirectUrl)}`);
    }

    // Copy headers (safely)
    const contentType = response.headers.get('content-type') || 'text/html';
    res.setHeader('Content-Type', contentType);

    // Rewrite relative URLs inside HTML so links stay proxied
    let text = await response.text();
    if (contentType.includes('text/html')) {
      text = text.replace(
        /((href|src)=["'])(?!https?:\/\/|data:|#|\/api\/proxy)/gi,
        `$1/api/proxy?url=${new URL('.', targetUrl).href}`
      );
      text = text.replace(
        /(action=["'])(?!https?:\/\/|data:|#|\/api\/proxy)/gi,
        `$1/api/proxy?url=${new URL('.', targetUrl).href}`
      );
    }

    res.status(response.status).send(text);
  } catch (err) {
    res.status(500).send(`Proxy error: ${err.message}`);
  }
}
