const express = require('express');
const http = require('http');
const path = require('path');

const app = express();
const staticFilesPath = path.resolve(__dirname, '../client');

// TODO: utilize this in proxyRequest
const proxyHosts = {
  chloeTitleService: {
    host: process.env.CHLOE_TITLE_HOST || '127.0.0.1',
    path: '/bundle.js',
    port: process.env.CHLOE_TITLE_HOST || 3000
  },
  justinDescriptionService: {
    host: process.env.JUSTIN_DESCRIPTION_HOST || '127.0.0.1',
    path: '/index.js',
    port: process.env.JUSTIN_DESCRIPTION_PORT || 7878
  }
};

const proxyRequest = ({ host, port, path }) => {
  return {
    port,
    path,
    host,
    method: 'GET',
    headers: {}
  };
};

app.use('/', express.static(staticFilesPath));

app.get('/chloe-title-service', (req, res) => {
  console.log('fetching chloe\'s bundle.js');

  // TODO: refactor proxy requests
  const options = proxyRequest(proxyHosts.chloeTitleService);

  const proxyConn = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode);
    proxyRes.setEncoding('utf8');

    proxyRes.on('data', data => res.write(data));
    proxyRes.on('close', data => res.end());
    proxyRes.on('end', data => res.end());
  }).on('error', err => {
    console.log(`failed to proxy request to ${proxyHosts.chloeTitleService}:${err.message}`);
  });

  proxyConn.end();
});

// chloe's service goes through this route
app.get('/title/:id', (req, res) => {
  console.log('proxying to chloe\'s service');

  const { id } = req.params;

  console.log(`fetching title with id: ${id}`);

  const {
    host,
    port
  } = proxyHosts.chloeTitleService;

  const proxyPath = `/api/${req.url}`;

  console.log(`proxying request to: ${proxyPath}`);

  const options = proxyRequest({
    host,
    port,
    path: proxyPath
  });

  const proxyConn = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode);
    proxyRes.setEncoding('utf8');

    proxyRes.on('data', data => res.write(data));
    proxyRes.on('close', data => res.end());
    proxyRes.on('end', data => res.end());
  }).on('error', err => {
    console.log(`failed to proxy request to ${proxyHosts.chloeTitleService}:${err.message}`);
  });

  proxyConn.end();
});

app.get('/justin-description-service', (req, res) => {
  console.log('fetching Justin\'s bundle.js');

  const options = proxyRequest(proxyHosts.justinDescriptionService);

  const proxyConn = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode);
    proxyRes.setEncoding('utf8');

    proxyRes.on('data', data => res.write(data));
    proxyRes.on('close', data => res.end());
    proxyRes.on('end', data => res.end());
  }).on('error', err => {
    console.log(`failed to proxy request to ${proxyHosts.justinDescriptionService}:${err.message}`);
  });

  proxyConn.end();
});

const port = process.env.APP_PORT || 8989;

app.listen(port, () => {
  console.log(`app is listening on http://localhost:${port}`);
});