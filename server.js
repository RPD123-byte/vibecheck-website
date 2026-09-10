const crypto = require('node:crypto');
const express = require('express');
const fs = require('fs');
const path = require('path');
const { PostHog } = require('posthog-node');

const localEnvPath = path.join(__dirname, '.env.local');
if (fs.existsSync(localEnvPath)) process.loadEnvFile(localEnvPath);

const posthogKey = process.env.VITE_PUBLIC_POSTHOG_KEY;
const posthogHost = process.env.VITE_PUBLIC_POSTHOG_HOST;
const missingPostHogVariable = !posthogKey
  ? 'VITE_PUBLIC_POSTHOG_KEY'
  : !posthogHost
    ? 'VITE_PUBLIC_POSTHOG_HOST'
    : null;

if (
  missingPostHogVariable &&
  process.env.NODE_ENV !== 'production' &&
  !process.env.NODE_TEST_CONTEXT
) {
  throw new Error(
    `${missingPostHogVariable} variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once ${missingPostHogVariable} is configured`,
  );
}

const posthogClient = posthogKey && posthogHost
  ? new PostHog(posthogKey, { host: posthogHost })
  : null;

posthogClient?.on('error', (error) => {
  console.error('PostHog client error:', error.message);
});

const {
  DEFAULT_BLOB_ORIGIN,
  DEFAULT_STABLE_CHANNEL_URL,
  resolveStableDownload,
} = require('./release-download');

const PORT = process.env.PORT || 3000;
const DOCUMENT_CACHE_CONTROL = 'no-store, max-age=0, must-revalidate';
const IMMUTABLE_ASSET_CACHE_CONTROL = 'public, max-age=31536000, immutable';
const POSTHOG_ID_PATTERN = /^[A-Za-z0-9_-]{1,200}$/;

function getPostHogContext(request) {
  const distinctId = request.query.ph_distinct_id;
  const sessionId = request.query.ph_session_id;

  return {
    distinctId:
      typeof distinctId === 'string' && POSTHOG_ID_PATTERN.test(distinctId)
        ? distinctId
        : crypto.randomUUID(),
    sessionId:
      typeof sessionId === 'string' && POSTHOG_ID_PATTERN.test(sessionId)
        ? sessionId
        : undefined,
  };
}

async function captureServerEvent(event) {
  if (!posthogClient || process.env.NODE_TEST_CONTEXT) return;
  try {
    await posthogClient.captureImmediate(event);
  } catch (error) {
    console.error('Could not send a PostHog server event:', error.message);
  }
}

async function captureServerException(error, distinctId) {
  if (!posthogClient || process.env.NODE_TEST_CONTEXT) return;
  try {
    await posthogClient.captureExceptionImmediate(error, distinctId, {
      flow: 'stable_download',
    });
  } catch (captureError) {
    console.error('Could not send a PostHog server exception:', captureError.message);
  }
}

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

  app.get('/download', async (request, response) => {
    const { distinctId, sessionId } = getPostHogContext(request);
    const analyticsProperties = {
      download_channel: 'stable',
      ...(sessionId ? { $session_id: sessionId } : {}),
    };

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
      await captureServerEvent({
        distinctId,
        event: 'download_resolved',
        properties: analyticsProperties,
      });
      response.redirect(302, url);
    } catch (error) {
      console.error('Could not resolve the stable Rapport download:', error.message);
      await captureServerEvent({
        distinctId,
        event: 'download_resolution_failed',
        properties: {
          ...analyticsProperties,
          error_type: error instanceof Error ? error.name : 'UnknownError',
        },
      });
      await captureServerException(error, distinctId);
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
