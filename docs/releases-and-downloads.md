# Rapport macOS download routing

The production landing page never links directly to a versioned DMG. Its call to
action points to `/download`, an application route in `server.js`.

For each request, `/download` reads the public Vercel Blob channel at
`channels/stable.json`, validates its schema and the DMG URL, and responds with a
temporary `302` redirect. The response is marked `no-store`. If the channel is
missing, malformed, unavailable, or points anywhere except the expected Rapport
Blob store, the route returns `503` instead of redirecting to an unknown or stale
file.

The channel URL can be overridden with `RAPPORT_STABLE_CHANNEL_URL`, and the
allowed artifact origin with `RAPPORT_BLOB_ORIGIN`. Production normally uses the
checked-in defaults for the `rapport-downloads` store. The route adds a one-minute
query bucket when it fetches the channel. Vercel Blob's minimum cache duration is
60 seconds, so a successful promotion can take at most about one minute to become
visible without causing every website request to miss the Blob CDN cache.

## Publishing contract

The `vibecheck` repository owns product builds and releases. A stable `vX.Y.Z`
tag starts its protected `macos-release` job. After signing, notarization,
stapling, and verification, that job:

1. uploads the DMG and ZIP to immutable `releases/<version>/...` Blob paths;
2. downloads those URLs and verifies their SHA-256 hashes;
3. creates the matching GitHub Release;
4. explicitly overwrites `channels/stable.json` with the new release metadata.

`stable.json` is a release pointer, not an index derived from timestamps. A newly
uploaded artifact is not publicized by the landing page until the release job
promotes it. Older immutable artifacts remain valid, which also supports a future
in-app updater and rollback by changing the channel pointer.

## Deployment ordering

The `/download` route requires `channels/stable.json` to exist. Before deploying
this website change to production, complete the first tag-driven release from the
`vibecheck` repository so CI creates that channel. There is deliberately no
hard-coded fallback to the old DMG: a missing channel should be visible as a
release-system error instead of silently serving an obsolete application.

The files under `rapport-hero/`, `remotion-animation/`, and the legacy
`public/index-vibecheck-old.html` page are not part of this production download
contract.
