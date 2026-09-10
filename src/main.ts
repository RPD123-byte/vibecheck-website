import "./styles.css";
import "./privacy.css";
import { posthogClient } from "./posthog";
import { initializeInteractions, setupHeaderScroll } from "./interactions";
import { pageMarkup } from "./page";
import { privacyMarkup } from "./privacy";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("Rapport website mount point was not found.");
}

const route = window.location.pathname.replace(/\/+$/, "") || "/";
const isPrivacyRoute = route === "/privacy";

document.body.classList.toggle("privacy-page", isPrivacyRoute);

if (isPrivacyRoute) {
  document.title = "Privacy — Rapport";
  document
    .querySelector<HTMLMetaElement>('meta[name="description"]')
    ?.setAttribute(
      "content",
      "Privacy policy for the Rapport Chrome extension and companion macOS app.",
    );
  app.innerHTML = privacyMarkup;
} else {
  app.innerHTML = pageMarkup;
  initializeInteractions();
}

setupHeaderScroll();

document.addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) return;

  const downloadLink = event.target.closest<HTMLAnchorElement>(
    'a[href="/download"], a[href^="/download?"]',
  );
  if (!downloadLink || !posthogClient) return;

  const ctaPlacement = downloadLink.closest(".site-header")
    ? "header"
    : downloadLink.closest(".hero")
      ? "hero"
      : downloadLink.closest(".closing")
        ? "closing"
        : downloadLink.closest(".footer")
          ? "footer"
          : "other";

  posthogClient.capture("download_cta_clicked", {
    cta_placement: ctaPlacement,
    page_route: route,
  });

  const downloadUrl = new URL(downloadLink.href, window.location.href);
  downloadUrl.searchParams.set("ph_distinct_id", posthogClient.get_distinct_id());
  const sessionId = posthogClient.get_session_id();
  if (sessionId) downloadUrl.searchParams.set("ph_session_id", sessionId);
  downloadLink.href = `${downloadUrl.pathname}${downloadUrl.search}${downloadUrl.hash}`;
});

if (import.meta.env.DEV) {
  void import("./agentation").then(({ mountAgentation }) => {
    mountAgentation();
  });
}
