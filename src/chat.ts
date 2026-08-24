import { later, queryAll, type Timer } from "./dom";

export function setupChatStories(reduceMotion: boolean): void {
  queryAll<HTMLElement>(document, ".chat-story").forEach((story) => {
    const items = queryAll<HTMLElement>(story, "[data-story-item]");
    const chat = story.querySelector<HTMLElement>(".codex-chat");
    const timers = new Set<Timer>();
    let looping = false;

    const schedule = (callback: () => void, delay: number): Timer => {
      const timer = later(() => {
        timers.delete(timer);
        callback();
      }, delay);
      timers.add(timer);
      return timer;
    };

    const keepItemVisible = (
      item: HTMLElement,
      behavior: ScrollBehavior = "smooth",
    ): void => {
      if (!chat) return;
      const chatRect = chat.getBoundingClientRect();
      const itemRect = item.getBoundingClientRect();
      const overflow = itemRect.bottom - chatRect.bottom + 12;
      if (overflow > 0) chat.scrollTo({ top: chat.scrollTop + overflow, behavior });
    };

    const resetStory = (): void => {
      items.forEach((item) => item.classList.remove("is-visible", "is-complete"));
      chat?.scrollTo({ top: 0, behavior: "auto" });
    };

    const revealAll = (): void => {
      items.forEach((item) => {
        item.classList.add("is-visible");
        if (item.classList.contains("codex-event")) item.classList.add("is-complete");
      });
      const lastItem = items.at(-1);
      if (lastItem) keepItemVisible(lastItem, "auto");
    };

    const playStory = (): void => {
      if (!looping) return;
      resetStory();
      schedule(() => {
        items.forEach((item, index) => schedule(() => {
          if (!looping) return;
          item.classList.add("is-visible");
          schedule(() => keepItemVisible(item), 40);
          if (item.classList.contains("codex-event")) {
            schedule(() => item.classList.add("is-complete"), 650);
          }
        }, index * 620));
        const finalRevealAt = Math.max(0, items.length - 1) * 620;
        const finalCompletionDelay = items.at(-1)?.classList.contains("codex-event") ? 650 : 0;
        const finalFrameAt = finalRevealAt + finalCompletionDelay;
        schedule(resetStory, finalFrameAt + 10_000);
        schedule(playStory, finalFrameAt + 10_320);
      }, 320);
    };

    const stopStory = (): void => {
      looping = false;
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
      resetStory();
    };

    if (reduceMotion) {
      revealAll();
    } else {
      const observer = new IntersectionObserver((entries) => {
        const isVisible = entries.some((entry) => entry.isIntersecting);
        if (isVisible && !looping) {
          looping = true;
          playStory();
        } else if (!isVisible && looping) {
          stopStory();
        }
      }, { threshold: 0.22 });
      observer.observe(story);
    }
  });
}
