const { getDefaultConfig } = require('expo/metro-config');
const http = require('http');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

const API_PORT = 5213;

// Proxy /api/* to the local SwellCaster API so physical devices only need
// Metro port 8081 (already reachable) instead of direct access to :5213.
config.server.enhanceMiddleware = (metroMiddleware) => {
  return (req, res, next) => {
    if (!req.url?.startsWith('/api/')) {
      return metroMiddleware(req, res, next);
    }

    const proxyReq = http.request(
      {
        hostname: '127.0.0.1',
        port: API_PORT,
        path: req.url,
        method: req.method,
        headers: { ...req.headers, host: `127.0.0.1:${API_PORT}` },
      },
      (proxyRes) => {
        res.writeHead(proxyRes.statusCode ?? 502, proxyRes.headers);
        proxyRes.pipe(res);
      }
    );

    proxyReq.on('error', (err) => {
      if (!res.headersSent) {
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            error: 'API proxy failed',
            message: err.message,
            hint: `Start the API: cd ../SwellCaster.API && dotnet run --urls http://127.0.0.1:${API_PORT}`,
          })
        );
      }
    });

    req.pipe(proxyReq);
  };
};

module.exports = config;
