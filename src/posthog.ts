import posthog from "posthog-js";

const posthogKey = import.meta.env.VITE_PUBLIC_POSTHOG_KEY;
const posthogHost = import.meta.env.VITE_PUBLIC_POSTHOG_HOST;
const missingVariable = !posthogKey
  ? "VITE_PUBLIC_POSTHOG_KEY"
  : !posthogHost
    ? "VITE_PUBLIC_POSTHOG_HOST"
    : null;

if (missingVariable && import.meta.env.DEV) {
  throw new Error(
    `${missingVariable} variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once ${missingVariable} is configured`,
  );
}

if (posthogKey && posthogHost) {
  posthog.init(posthogKey, {
    api_host: posthogHost,
    defaults: "2026-05-30",
    capture_exceptions: true,
  });
}

export const posthogClient = posthogKey && posthogHost ? posthog : null;
