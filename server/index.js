const express = require('express');
const http = require('http');
const https = require('https');
const path = require('path');

const app = express();
const staticFilesPath = path.resolve(__dirname, '../client');

const removeTrailingSlash = (req, res, next) => {
  if (req.url.slice(-1) === '/') {
    req.url = req.url.slice(0, -1);
  }

  next();
};

// TODO: utilize this in proxyRequest
const proxyHosts = {
  chloeTitleService: {
    host: process.env.CHLOE_TITLE_HOST || '127.0.0.1',
    path: '/bundle.js',
    port: process.env.CHLOE_TITLE_PORT || 5500
  },
  justinDescriptionService: {
    host: process.env.JUSTIN_DESCRIPTION_HOST || '127.0.0.1',
    path: '/index.js',
    port: process.env.JUSTIN_DESCRIPTION_PORT || 7878
  },
  carolynPhotoService: {
    host: process.env.CAROLYN_PHOTO_HOST || '127.0.0.1',
    path: '/bundle.js',
    port: process.env.CAROLYN_PHOTO_PORT || 3000
  },
  melanieReviewService: {
    host: process.env.MELANIE_REVIEW_HOST || '127.0.0.1',
    path: '/bundle.js',
    port: process.env.MELANIE_REVIEW_PORT || 1969
  }
};

const proxyRequest = ({ host, port, path }) => {
  const timeout = 6;

  let options = {
    path,
    host,
    method: 'GET',
    headers: {},
    timeout: timeout * 1000
  };

  if (port !== 'null' && !!port) {
    options.port = port;
  }

  return options;
};

app.get('/', (req, res) => {
  res.redirect('/rooms/1');

  res.end();
});

app.get('/rooms/:id', (req, res, next) => {
  // catch invalid id
  const id = req.params.id;
  const notFoundFilePath = path.join(staticFilesPath, 'notFound.html');
  const indexPath = path.join(staticFilesPath, 'index.html');
  const validIDRange = 100;

  if (!id) {
    res.sendFile(notFoundFilePath);

    return;
  }

  const idToNumber = Number(id);
  const isInvalidID = typeof idToNumber === NaN || idToNumber <= 0 || id > 100;

  if (isInvalidID) {
    console.log('invalid id requested');

    res.sendFile(notFoundFilePath);
    return;
  }

  res.sendFile(indexPath);
});

app.get('/chloe-title-service', (req, res) => {
  console.log('fetching chloe\'s bundle.js...');

  // TODO: refactor proxy requests
  const options = proxyRequest(proxyHosts.chloeTitleService);

  const proxyConn = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode);
    proxyRes.setEncoding('utf8');

    proxyRes.on('data', data => res.write(data));
    proxyRes.on('close', data => res.end());
    proxyRes.on('end', data => res.end());
  }).on('error', err => {
    console.log(`fetching chloe's service bundle failed: ${err.message}`);
    res.end();
  });

  proxyConn.end();
});

// chloe's service goes through this route
app.get('/title/:id', (req, res) => {
  console.log('proxying to chloe\'s service...');

  const { id } = req.params;

  console.log(`fetching title with id: ${id}`);

  const {
    host,
    port
  } = proxyHosts.chloeTitleService;

  // const proxyPath = `/api${req.url}`;
  const proxyPath = req.url;

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
    console.log(`failed to fetch chloe's title service: ${err.message}`);
    res.end();
  });

  proxyConn.end();
});

app.get('/justin-description-service', (req, res) => {
  console.log('fetching Justin\'s bundle.js...');

  const {
    host,
    path,
    port
  } = proxyHosts.justinDescriptionService;

  let endpoint = host;
  let proxyReq = http;

  if (host.indexOf('http:') < 0 && host.indexOf('https:') < 0) {
    endpoint = `https://${host}`;

    proxyReq = https;
  }

  if (port !== 'null') {
    endpoint += `:${port}`;
  }

  endpoint += path;

  const proxyConn = proxyReq.get(endpoint, (proxyRes) => {
    res.writeHead(proxyRes.statusCode);
    proxyRes.setEncoding('utf8');

    proxyRes.on('data', data => res.write(data));
    proxyRes.on('close', data => res.end());
    proxyRes.on('end', data => res.end());
  }).on('error', err => {
    console.log(`fetching justin's service bundle failed: ${err.message}`);
    res.end();
  });

  proxyConn.end();
});

app.get('/api/listing/:id', (req, res) => {
  console.log('proxying api request to justin\'s api endpoint...');

  // const options = proxyRequest(proxyHosts.justinDescriptionService);

  // options.path = req.url;

  const {
    host,
    path,
    port
  } = proxyHosts.justinDescriptionService;

  let endpoint = host;
  let proxyReq = http;

  if (host.indexOf('http:') < 0 && host.indexOf('https:') < 0) {
    endpoint = `https://${host}`;

    proxyReq = https;
  }

  if (port !== 'null') {
    endpoint += `:${port}`;
  }

  endpoint += req.url;

  const proxyConn = proxyReq.get(endpoint, (proxyRes) => {
    res.writeHead(proxyRes.statusCode);
    proxyRes.setEncoding('utf8');

    proxyRes.on('data', data => res.write(data));
    proxyRes.on('close', data => res.end());
    proxyRes.on('end', data => res.end());
  }).on('error', err => {
    console.log(`fetching justin's description service failed: ${err.message}`);
    res.end();
  });

  proxyConn.end();
});

app.get('/carolyn-photo-service', (req, res) => {
  console.log('fetching Carolyn\'s bundle.js...');

  const options = proxyRequest(proxyHosts.carolynPhotoService);

  const proxyConn = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode);
    proxyRes.setEncoding('utf8');

    proxyRes.on('data', data => res.write(data));
    proxyRes.on('close', data => res.end());
    proxyRes.on('end', data => res.end());
  }).on('error', err => {
    console.log(`fetching carolyn's service bundle failed: ${err.message}`);
    res.end();
  });

  proxyConn.end();
});

app.get('/:id/photos', (req, res) => {
  console.log('fetching Carolyn\'s photo service...');

  const {
    host,
    port
  } = proxyHosts.carolynPhotoService;

  const options = proxyRequest({
    host,
    port,
    path: req.url
  });

  const proxyConn = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode);
    proxyRes.setEncoding('utf8');

    proxyRes.on('data', data => res.write(data));
    proxyRes.on('close', data => res.end());
    proxyRes.on('end', data => res.end());
  }).on('error', err => {
    console.log(`fetching from carolyn's photo service failed: ${err.message}`);
    res.end();
  });

  proxyConn.end();
});

app.get('/melanie-review-service', (req, res) => {
  console.log('fetching Melanie\'s bundle.js...');

  const options = proxyRequest(proxyHosts.melanieReviewService);

  options.protocol = 'http:';

  const proxyConn = http.get(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode);
    proxyRes.setEncoding('utf8');

    proxyRes.on('data', data => res.write(data));
    proxyRes.on('close', data => res.end());
    proxyRes.on('end', data => res.end());
  }).on('error', err => {
    console.log(`fetching from melanie's service bundle failed: ${err.message}`);
    res.end();
  });

  proxyConn.end();
});


app.get('/reviews/:id', (req, res) => {
  console.log('fetching Melanie\'s review service...');

  const {
    host,
    port
  } = proxyHosts.melanieReviewService;

  const options = proxyRequest({
    host,
    port,
    path: req.url
  });

  const proxyConn = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode);
    proxyRes.setEncoding('utf8');

    proxyRes.on('data', data => res.write(data));
    proxyRes.on('close', data => res.end());
    proxyRes.on('end', data => res.end());
  }).on('error', err => {
    console.log(`fetching from melanie's review service failed: ${err.message}`);
    res.end();
  });

  proxyConn.end();
});

app.get('/stars/:id', (req, res) => {
  console.log('fetching Melanie\'s star service...');

  const {
    host,
    port
  } = proxyHosts.melanieReviewService;

  const options = proxyRequest({
    host,
    port,
    path: req.url
  });

  const proxyConn = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode);
    proxyRes.setEncoding('utf8');

    proxyRes.on('data', data => res.write(data));
    proxyRes.on('close', data => res.end());
    proxyRes.on('end', data => res.end());
  }).on('error', err => {
    console.log(`fetching from melanie's star service failed: ${err.message}`);
    res.end();
  });

  proxyConn.end();
});


const port = process.env.APP_PORT || 8989;

app.listen(port, () => {
  console.log(`app is listening on http://localhost:${port}`);
});