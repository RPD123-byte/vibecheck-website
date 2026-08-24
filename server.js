const express = require('express');
const fs = require('fs');
const path = require('path');
const {
  DEFAULT_BLOB_ORIGIN,
  DEFAULT_STABLE_CHANNEL_URL,
  resolveStableDownload,
} = require('./release-download');

const PORT = process.env.PORT || 3000;

function createApp({
  fetchImpl = globalThis.fetch,
  stableChannelUrl =
    process.env.RAPPORT_STABLE_CHANNEL_URL || DEFAULT_STABLE_CHANNEL_URL,
  allowedBlobOrigin =
    process.env.RAPPORT_BLOB_ORIGIN || DEFAULT_BLOB_ORIGIN,
  now = Date.now,
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
  const staticRoot = fs.existsSync(path.join(builtSite, 'index.html'))
    ? builtSite
    : path.join(__dirname, 'public');

  app.get(['/privacy', '/privacy/'], (_request, response) => {
    response.sendFile(path.join(staticRoot, 'index.html'));
  });

  app.use(express.static(staticRoot));
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
