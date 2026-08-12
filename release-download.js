const DEFAULT_STABLE_CHANNEL_URL =
  'https://85hiestf5k30uncv.public.blob.vercel-storage.com/channels/stable.json';
const DEFAULT_BLOB_ORIGIN =
  'https://85hiestf5k30uncv.public.blob.vercel-storage.com';
const MAX_CHANNEL_BYTES = 16 * 1024;
const FETCH_TIMEOUT_MS = 5_000;
const STABLE_SEMVER = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
const SHA256 = /^[a-f0-9]{64}$/;

function validateStableChannel(channel, allowedBlobOrigin = DEFAULT_BLOB_ORIGIN) {
  if (
    !channel ||
    channel.schemaVersion !== 1 ||
    channel.channel !== 'stable' ||
    !STABLE_SEMVER.test(channel.version) ||
    !channel.artifacts?.dmg
  ) {
    throw new Error('stable channel schema is invalid');
  }

  const dmg = channel.artifacts.dmg;
  const url = new URL(dmg.url);
  const allowed = new URL(allowedBlobOrigin);
  if (
    url.protocol !== 'https:' ||
    url.origin !== allowed.origin ||
    !url.pathname.includes(`/releases/${channel.version}/`) ||
    !url.pathname.toLowerCase().endsWith('.dmg') ||
    !SHA256.test(dmg.sha256) ||
    !Number.isSafeInteger(dmg.size) ||
    dmg.size <= 0
  ) {
    throw new Error('stable DMG metadata is invalid');
  }
  return url.toString();
}

async function resolveStableDownload({
  fetchImpl = globalThis.fetch,
  stableChannelUrl = DEFAULT_STABLE_CHANNEL_URL,
  allowedBlobOrigin = DEFAULT_BLOB_ORIGIN,
  now = Date.now,
} = {}) {
  if (typeof fetchImpl !== 'function') throw new Error('fetch is unavailable');
  const channelUrl = new URL(stableChannelUrl);
  channelUrl.searchParams.set('minute', String(Math.floor(now() / 60_000)));
  const response = await fetchImpl(channelUrl, {
    headers: { accept: 'application/json' },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`stable channel returned HTTP ${response.status}`);
  const text = await response.text();
  if (Buffer.byteLength(text, 'utf8') > MAX_CHANNEL_BYTES) {
    throw new Error('stable channel is too large');
  }
  return validateStableChannel(JSON.parse(text), allowedBlobOrigin);
}

module.exports = {
  DEFAULT_BLOB_ORIGIN,
  DEFAULT_STABLE_CHANNEL_URL,
  resolveStableDownload,
  validateStableChannel,
};
