const express = require('express');
const http = require('http');
const path = require('path');

const app = express();
const staticFilesPath = path.resolve(__dirname, '../client');

// TODO: utilize this in proxyRequest
const proxyHosts = {
  chloeTitleService: process.env.CHLOE_TITLE_HOST || '127.0.0.1',
  justinDescriptionService: {
    host: process.env.JUSTIN_DESCRIPTION_HOST || '127.0.0.1',
    port: process.env.JUSTIN_DESCRIPTION_PORT || 7878
  }
};

const proxyRequest = (host, port, path) => {
  return {
    port,
    path,
    host: '127.0.0.1',
    method: 'GET',
    headers: {}
  };
};

app.use('/', express.static(staticFilesPath));

app.get('/chloe-title-service', (req, res) => {
  console.log('fetching chloe\'s bundle.js');

  res.status(200).send();
});

app.get('/justin-description-service', (req, res) => {
  console.log('fetching Justin\'s bundle.js');

  const options = proxyRequest(proxyHosts.justinDescriptionService, '/index.js', 7878);

  const proxyConn = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode);
    proxyRes.setEncoding('utf8');

    proxyRes.on('data', data => res.write(data));
    proxyRes.on('close', data => res.end());
    proxyRes.on('end', data => res.end());
  }).on('error', err => {
    console.log(`failed to proxy request to ${proxyHost.justinDescriptionService}:${err.message}`);
  });

  proxyConn.end();
});

const port = process.env.APP_PORT || 8989;

app.listen(port, () => {
  console.log(`app is listening on http://localhost:${port}`);
});