export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({
        error: true,
        message: 'Missing URL parameter',
        status: 400
      });
    }

    let targetUrl = decodeURIComponent(url)
      .replace(/^https:\/(?!\/)/, 'https://')
      .replace(/^http:\/(?!\/)/, 'http://');

    let targetUrlObj;
    try {
      targetUrlObj = new URL(targetUrl);
    } catch (e) {
      return res.status(400).json({
        error: true,
        message: 'Invalid target URL',
        status: 400
      });
    }

    const referer = ${targetUrlObj.protocol}//${targetUrlObj.hostname};
    const origin = ${targetUrlObj.protocol}//${targetUrlObj.hostname};

    const headers = {
      'Referer': referer,
      'Origin': origin,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': '/',
      'Accept-Language': 'en-US,en;q=0.9',
      'Sec-Fetch-Mode': 'cors'
    };

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: headers,
      redirect: 'follow'
    });

    if (!response.ok) {
      return res.status(response.status).json({
        error: true,
        message: Target server responded with ${response.status},
        status: response.status
      });
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Expose-Headers', '*');

    const isManifest = /\.m3u8(?:\?|$)/i.test(targetUrl);
    const isSegment = /\.(ts|aaa|vtt|jpg|png)(?:\?|$)/i.test(targetUrl);

    if (isManifest) {
      res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
      res.setHeader('Cache-Control', 'no-cache');
      
      const text = await response.text();
      return res.status(response.status).send(text);
    }
    else if (isSegment) {
      res.setHeader('Content-Type', 'video/mp2t');
      res.setHeader('Cache-Control', 'public, max-age=604800');
      
      const arrayBuffer = await response.arrayBuffer();
      return res.status(response.status).send(Buffer.from(arrayBuffer));
    }
    else {
      const arrayBuffer = await response.arrayBuffer();
      return res.status(response.status).send(Buffer.from(arrayBuffer));
    }
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: Proxy Error: ${error.message},
      status: 500
    });
  }
}