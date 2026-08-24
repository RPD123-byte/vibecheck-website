import { later, queryAll, selectVariation, type Timer } from "./dom";

export function setupFeedbackDemo(
  sourceWindow: HTMLElement,
  reduceMotion: boolean,
): void {
  const feedbackSlot = document.querySelector<HTMLElement>("[data-browser-clone]");
  const feedbackStage = feedbackSlot?.closest<HTMLElement>(".feedback-stage");
  if (!feedbackSlot || !feedbackStage) return;

  const browserClone = sourceWindow.cloneNode(true) as HTMLElement;
  browserClone.classList.add("feedback-browser");
  queryAll<HTMLElement>(browserClone, ".demo-tab,.variation-tile").forEach(
    (item) => item.classList.add("is-visible"),
  );
  queryAll<HTMLElement>(browserClone, ".is-rejected,.is-kept,.is-selected").forEach(
    (item) => item.classList.remove("is-rejected", "is-kept", "is-selected"),
  );
  feedbackSlot.append(browserClone);

  const feedbackTabs = queryAll<HTMLElement>(browserClone, ".demo-tab");
  const feedbackTiles = queryAll<HTMLElement>(browserClone, ".variation-tile");
  const cornerBubble = feedbackStage.querySelector<HTMLElement>(".rapport-corner-bar");
  const typedNote = feedbackStage.querySelector<HTMLElement>(".rapport-typed-note");
  const typedNoteCopy = typedNote?.querySelector<HTMLElement>("[data-typed-note]");
  if (!cornerBubble || !typedNote || !typedNoteCopy) return;

  const typedNoteText = typedNoteCopy.dataset.copy ?? "";
  const feedbackTimers = new Set<Timer>();
  let feedbackLooping = false;

  const scheduleFeedback = (callback: () => void, delay: number): Timer => {
    const timer = later(() => {
      feedbackTimers.delete(timer);
      callback();
    }, delay);
    feedbackTimers.add(timer);
    return timer;
  };

  const clearFeedbackTimers = (): void => {
    feedbackTimers.forEach((timer) => clearTimeout(timer));
    feedbackTimers.clear();
  };

  const getFeedbackTargetIndex = (): number => {
    const visibleTiles = feedbackTiles.filter(
      (tile) => getComputedStyle(tile).display !== "none" && tile.getClientRects().length > 0,
    );
    if (!visibleTiles.length) return 0;
    const topEdge = Math.min(...visibleTiles.map((tile) => tile.getBoundingClientRect().top));
    const topRow = visibleTiles.filter(
      (tile) => Math.abs(tile.getBoundingClientRect().top - topEdge) < 3,
    );
    const firstTile = topRow[0];
    if (!firstTile) return 0;
    const rightmostTile = topRow.reduce((rightmost, tile) =>
      tile.getBoundingClientRect().right > rightmost.getBoundingClientRect().right
        ? tile
        : rightmost,
    );
    return feedbackTiles.indexOf(rightmostTile);
  };

  const positionFeedbackCursor = (): void => {
    const targetTile = feedbackTiles[getFeedbackTargetIndex()];
    if (!targetTile) return;
    const tileRect = targetTile.getBoundingClientRect();
    const stageRect = feedbackStage.getBoundingClientRect();
    feedbackStage.style.setProperty(
      "--feedback-cursor-left",
      `${((tileRect.left + tileRect.width * 0.72 - stageRect.left) / stageRect.width) * 100}%`,
    );
    feedbackStage.style.setProperty(
      "--feedback-cursor-top",
      `${((tileRect.top + tileRect.height * 0.34 - stageRect.top) / stageRect.height) * 100}%`,
    );
  };

  const selectFeedbackTarget = (): void =>
    selectVariation(browserClone, getFeedbackTargetIndex());

  const positionCornerBubble = (): void => {
    const selectedTile = browserClone.querySelector<HTMLElement>(".variation-tile.is-selected");
    if (!selectedTile) return;
    const tileRect = selectedTile.getBoundingClientRect();
    const stageRect = feedbackStage.getBoundingClientRect();
    const interpolateResponsiveValue = (
      viewportWidth: number,
      minWidth: number,
      maxWidth: number,
      minScale: number,
      maxScale: number,
    ): number => {
      const progress = Math.min(1, Math.max(0, (viewportWidth - minWidth) / (maxWidth - minWidth)));
      return minScale + (maxScale - minScale) * progress;
    };
    const responsiveScale = innerWidth <= 520
      ? interpolateResponsiveValue(innerWidth, 360, 520, 0.21, 0.27)
      : innerWidth <= 680
        ? interpolateResponsiveValue(innerWidth, 521, 680, 0.27, 0.44)
        : innerWidth <= 1009
          ? interpolateResponsiveValue(innerWidth, 681, 1009, 0.44, 0.86)
          : null;
    const responsiveNoteGap = innerWidth <= 520
      ? interpolateResponsiveValue(innerWidth, 360, 520, 6, 7)
      : innerWidth <= 680
        ? interpolateResponsiveValue(innerWidth, 521, 680, 7, 10)
        : innerWidth <= 1009
          ? interpolateResponsiveValue(innerWidth, 681, 1009, 10, 16)
          : null;
    if (responsiveScale === null) cornerBubble.style.removeProperty("--rapport-corner-scale");
    else cornerBubble.style.setProperty("--rapport-corner-scale", responsiveScale.toFixed(4));
    if (responsiveNoteGap === null) typedNote.style.removeProperty("--rapport-note-gap");
    else typedNote.style.setProperty("--rapport-note-gap", `${responsiveNoteGap.toFixed(2)}px`);
    const scale = Number.parseFloat(
      getComputedStyle(cornerBubble).getPropertyValue("--rapport-corner-scale"),
    ) || 1;
    const noteGap = Number.parseFloat(
      getComputedStyle(typedNote).getPropertyValue("--rapport-note-gap"),
    ) || 24;
    const desiredBubbleLeft = tileRect.right + 14 * scale;
    const feedbackWidth = 306 * scale + noteGap + typedNote.offsetWidth;
    const shouldFlipLeft =
      innerWidth <= 1009 || desiredBubbleLeft + feedbackWidth > innerWidth - 8;
    const baseBubbleTop = tileRect.top - 53;
    let bubbleStyleLeft: number;
    let noteLeft: number;

    if (shouldFlipLeft) {
      const visualBubbleRight = tileRect.left - 14 * scale;
      const visualBubbleLeft = visualBubbleRight - 306 * scale;
      noteLeft = visualBubbleLeft - noteGap - typedNote.offsetWidth;
      bubbleStyleLeft = visualBubbleRight - 306;
      cornerBubble.dataset.placement = "outside-top-left";
      typedNote.dataset.noteSide = "left";
    } else {
      bubbleStyleLeft = desiredBubbleLeft;
      noteLeft = bubbleStyleLeft + 306 * scale + noteGap;
      cornerBubble.dataset.placement = "outside-top-right";
      typedNote.dataset.noteSide = "right";
    }

    const noteTop = baseBubbleTop + 53 * (1 - scale);
    const copyHeading = feedbackStage
      .closest<HTMLElement>(".story-inner")
      ?.querySelector<HTMLElement>(".story-copy h2");
    const headingRect = copyHeading?.getBoundingClientRect();
    const crossesHeadingColumn =
      headingRect &&
      noteLeft < headingRect.right &&
      noteLeft + typedNote.offsetWidth > headingRect.left;
    const verticalShift = innerWidth > 1009 && crossesHeadingColumn
      ? Math.max(0, noteTop + typedNote.offsetHeight - (headingRect.top - 16))
      : 0;
    const bubbleTop = baseBubbleTop - verticalShift;

    cornerBubble.style.left = `${bubbleStyleLeft - stageRect.left}px`;
    cornerBubble.style.top = `${bubbleTop - stageRect.top}px`;
    typedNote.style.setProperty("--rapport-note-connector-y", `${(53 * scale) / 2}px`);
    typedNote.style.left = `${noteLeft - stageRect.left}px`;
    typedNote.style.top = `${bubbleTop - stageRect.top + 53 * (1 - scale)}px`;
  };

  const typeFeedbackNote = (onComplete: () => void = () => {}): void => {
    if (reduceMotion) {
      typedNoteCopy.textContent = typedNoteText;
      onComplete();
      return;
    }
    typedNoteCopy.textContent = "";
    let index = 0;
    const typeNext = (): void => {
      if (!feedbackLooping) return;
      typedNoteCopy.textContent = typedNoteText.slice(0, ++index);
      if (index < typedNoteText.length) scheduleFeedback(typeNext, 24);
      else onComplete();
    };
    scheduleFeedback(typeNext, 180);
  };

  feedbackTabs.forEach((tab, index) =>
    tab.addEventListener("click", () => selectVariation(browserClone, index)),
  );
  feedbackTiles.forEach((tile, index) =>
    tile.addEventListener("click", () => selectVariation(browserClone, index)),
  );

  const finishFeedback = (): void => {
    selectFeedbackTarget();
    positionFeedbackCursor();
    positionCornerBubble();
    feedbackStage.classList.add("is-entered", "is-selecting", "is-clicked", "is-labeled");
    typeFeedbackNote();
  };

  const resetFeedback = (): void => {
    feedbackStage.classList.remove("is-entered", "is-selecting", "is-clicked", "is-labeled");
    selectVariation(browserClone, -1);
    typedNoteCopy.textContent = "";
  };

  const playFeedback = (): void => {
    if (!feedbackLooping) return;
    clearFeedbackTimers();
    resetFeedback();
    positionFeedbackCursor();
    scheduleFeedback(() => feedbackStage.classList.add("is-entered"), 320);
    scheduleFeedback(() => feedbackStage.classList.add("is-selecting"), 770);
    scheduleFeedback(() => {
      feedbackStage.classList.add("is-clicked");
      selectFeedbackTarget();
    }, 1570);
    scheduleFeedback(() => {
      positionCornerBubble();
      feedbackStage.classList.add("is-labeled");
      typeFeedbackNote(() => scheduleFeedback(playFeedback, 5000));
    }, 1870);
  };

  const stopFeedback = (): void => {
    feedbackLooping = false;
    clearFeedbackTimers();
    resetFeedback();
  };

  addEventListener("resize", () => {
    positionFeedbackCursor();
    if (feedbackStage.classList.contains("is-clicked")) selectFeedbackTarget();
    positionCornerBubble();
  }, { passive: true });

  if (reduceMotion) {
    finishFeedback();
  } else {
    const observer = new IntersectionObserver((entries) => {
      const isVisible = entries.some((entry) => entry.isIntersecting);
      if (isVisible && !feedbackLooping) {
        feedbackLooping = true;
        playFeedback();
      } else if (!isVisible && feedbackLooping) {
        stopFeedback();
      }
    }, { threshold: 0.35 });
    observer.observe(feedbackStage);
  }
}
