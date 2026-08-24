import { setupChatStories } from "./chat";
import { setupHero } from "./hero";

export function initializeInteractions(): void {
  document.body.classList.add("has-js");
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  setupHero(reduceMotion);
  setupChatStories(reduceMotion);
}
