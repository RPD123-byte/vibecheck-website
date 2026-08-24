const express = require('express');
const fs = require('fs');
const path = require('path');
const {
  DEFAULT_BLOB_ORIGIN,
  DEFAULT_STABLE_CHANNEL_URL,
  resolveStableDownload,
} = require('./release-download');

const PORT = process.env.PORT || 3000;
const DOCUMENT_CACHE_CONTROL = 'no-store, max-age=0, must-revalidate';
const IMMUTABLE_ASSET_CACHE_CONTROL = 'public, max-age=31536000, immutable';

function setDocumentCacheHeaders(response) {
  response.set({
    'Cache-Control': DOCUMENT_CACHE_CONTROL,
    Pragma: 'no-cache',
    Expires: '0',
  });
}

function createApp({
  fetchImpl = globalThis.fetch,
  stableChannelUrl =
    process.env.RAPPORT_STABLE_CHANNEL_URL || DEFAULT_STABLE_CHANNEL_URL,
  allowedBlobOrigin =
    process.env.RAPPORT_BLOB_ORIGIN || DEFAULT_BLOB_ORIGIN,
  now = Date.now,
  staticRoot: configuredStaticRoot,
} = {}) {
  const app = express();

  app.get('/download', async (_request, response) => {
    response.set({
      'Cache-Control': 'no-store, max-age=0',
      Pragma: 'no-cache',
      'X-Content-Type-Options': 'nosniff',
    });
    try {
      const url = await resolveStableDownload({
        fetchImpl,
        stableChannelUrl,
        allowedBlobOrigin,
        now,
      });
      response.redirect(302, url);
    } catch (error) {
      console.error('Could not resolve the stable Rapport download:', error.message);
      response.status(503).type('text/plain').send('The download is temporarily unavailable.');
    }
  });

  const builtSite = path.join(__dirname, 'dist');
  const staticRoot =
    configuredStaticRoot ||
    (fs.existsSync(path.join(builtSite, 'index.html'))
      ? builtSite
      : path.join(__dirname, 'public'));

  app.get(['/privacy', '/privacy/'], (_request, response) => {
    setDocumentCacheHeaders(response);
    response.sendFile(path.join(staticRoot, 'index.html'));
  });

  app.use(
    express.static(staticRoot, {
      setHeaders(response, filePath) {
        const relativePath = path.relative(staticRoot, filePath).split(path.sep).join('/');

        if (path.extname(filePath) === '.html') {
          setDocumentCacheHeaders(response);
        } else if (relativePath.startsWith('assets/')) {
          response.set('Cache-Control', IMMUTABLE_ASSET_CACHE_CONTROL);
        }
      },
    }),
  );
  return app;
}

const app = createApp();

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`vibe check ✨ http://localhost:${PORT}`);
  });
}

module.exports = app;
module.exports.createApp = createApp;
