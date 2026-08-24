import { setupChatStories } from "./chat";
import { setupHero } from "./hero";

export function setupHeaderScroll(): void {
  const header = document.querySelector<HTMLElement>(".site-header");

  if (!header) return;

  let frame = 0;
  const updateHeader = (): void => {
    frame = 0;
    header.classList.toggle("is-scrolled", window.scrollY > 4);
  };

  const queueUpdate = (): void => {
    if (frame) return;
    frame = window.requestAnimationFrame(updateHeader);
  };

  updateHeader();
  window.addEventListener("scroll", queueUpdate, { passive: true });
}

export function initializeInteractions(): void {
  document.body.classList.add("has-js");
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  setupHero(reduceMotion);
  setupChatStories(reduceMotion);
}
