import "./styles.css";
import "./privacy.css";
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

if (import.meta.env.DEV) {
  void import("./agentation").then(({ mountAgentation }) => {
    mountAgentation();
  });
}
