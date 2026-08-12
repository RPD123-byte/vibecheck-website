const assert = require('node:assert/strict');
const { once } = require('node:events');
const test = require('node:test');
const serverModule = require('../server');
const { createApp } = serverModule;

const origin = 'https://store.public.blob.vercel-storage.com';
const stable = {
  schemaVersion: 1,
  channel: 'stable',
  version: '1.2.3',
  artifacts: {
    dmg: {
      url: `${origin}/releases/1.2.3/Rapport-1.2.3-arm64.dmg`,
      sha256: 'a'.repeat(64),
      size: 123,
    },
  },
};

test('server module exports the Express app for Vercel', () => {
  assert.equal(typeof serverModule, 'function');
  assert.equal(typeof serverModule.createApp, 'function');
});

async function serve(app, callback) {
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  try {
    await callback(`http://127.0.0.1:${server.address().port}`);
  } finally {
    server.close();
    await once(server, 'close');
  }
}

test('GET /download redirects to the validated stable DMG without caching', async () => {
  let fetchedUrl;
  const app = createApp({
    allowedBlobOrigin: origin,
    stableChannelUrl: `${origin}/channels/stable.json`,
    now: () => 120_000,
    fetchImpl: async (url) => {
      fetchedUrl = url.toString();
      return new Response(JSON.stringify(stable));
    },
  });
  await serve(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/download`, { redirect: 'manual' });
    assert.equal(response.status, 302);
    assert.equal(response.headers.get('location'), stable.artifacts.dmg.url);
    assert.match(response.headers.get('cache-control'), /no-store/);
    assert.equal(fetchedUrl, `${origin}/channels/stable.json?minute=2`);
  });
});

test('GET /download fails closed for malformed or untrusted channel data', async () => {
  const app = createApp({
    allowedBlobOrigin: origin,
    fetchImpl: async () =>
      new Response(
        JSON.stringify({
          ...stable,
          artifacts: { dmg: { ...stable.artifacts.dmg, url: 'https://example.com/app.dmg' } },
        }),
      ),
  });
  await serve(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/download`, { redirect: 'manual' });
    assert.equal(response.status, 503);
    assert.equal(response.headers.get('location'), null);
  });
});

test('GET /download returns 503 when the stable channel is unavailable', async () => {
  const app = createApp({ fetchImpl: async () => new Response('', { status: 500 }) });
  await serve(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/download`, { redirect: 'manual' });
    assert.equal(response.status, 503);
  });
});

test('non-GET methods do not resolve a download', async () => {
  let called = false;
  const app = createApp({
    fetchImpl: async () => {
      called = true;
      return new Response(JSON.stringify(stable));
    },
  });
  await serve(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/download`, { method: 'POST' });
    assert.equal(response.status, 404);
    assert.equal(called, false);
  });
});
