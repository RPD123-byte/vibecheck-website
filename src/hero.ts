import { later, queryAll, selectVariation } from "./dom";
import { setupFeedbackDemo } from "./feedback";
import { posthogClient } from "./posthog";

type AssetReference = readonly [name: string, weak: boolean];

type ScatterSpec = {
  asset: string;
  weak?: boolean;
  left: number;
  top: number;
  width: number;
  rotation: number;
  z: number;
  overlay?: boolean;
  neighbor?: boolean;
};

const generatedRapportAssets: AssetReference[] = [
  ["rapport-concept-01-editorial", false],
  ["rapport-concept-02-midnight", false],
  ["rapport-concept-03-cobalt", false],
  ["rapport-concept-04-moss", false],
  ["rapport-concept-05-brutal", false],
  ["rapport-concept-06-pink", false],
  ["rapport-concept-07-orange", false],
  ["rapport-concept-08-mono", false],
  ["rapport-concept-09-plum", false],
  ["rapport-concept-10-teal", false],
  ["rapport-concept-11-clay", false],
  ["rapport-concept-12-black", false],
  ["rapport-concept-13-docs", false],
  ["rapport-concept-14-audio", false],
  ["rapport-concept-15-poster", false],
  ["rapport-concept-16-ice", false],
  ["rapport-concept-17-cream", false],
  ["rapport-concept-18-green", false],
];

const historicalRapportAssets: AssetReference[] = [
  ["portrait-faithful", false],
  ["portrait-rivet-exact", false],
  ["portrait-rivet-exact-rapport-fonts", false],
  ["portrait-rivet-exact-rapport-fonts-dither", false],
  ["portrait-rivet-left-rise", false],
  ["portrait-rivet-left-rise-archivo-black", true],
  ["portrait-rivet-left-rise-balto", false],
  ["portrait-rivet-left-rise-balto-clean", false],
  ["portrait-rivet-left-rise-blowbrush", true],
  ["portrait-rivet-left-rise-sun-noodle", false],
  ["portrait-rivet-literal", false],
  ["portrait-rivet-spacing-1", false],
  ["portrait-rivet-spacing-2", true],
  ["portrait-rivet-spacing-3", false],
  ["portrait-rivet-spacing-4", true],
  ["portrait-rivet-spacing-5", false],
];

function createScatterSpecs(): ScatterSpec[] {
  const field = Array.from({ length: 72 }, (_, index): ScatterSpec => {
    const source =
      index % 5 === 4 ? historicalRapportAssets : generatedRapportAssets;
    const reference = source[index % source.length];
    if (!reference) throw new Error("Rapport scatter source is missing.");
    const [asset, weak] = reference;
    const lane = index % 5;
    let left: number;
    let top: number;

    if (lane === 0) {
      left = -24 + ((index * 11) % 20);
      top = -12 + ((index * 37) % 300);
    } else if (lane === 1) {
      left = 96 + ((index * 13) % 27);
      top = -12 + ((index * 41) % 300);
    } else if (lane === 2) {
      left = -22 + ((index * 17) % 19);
      top = 326 + ((index * 43) % 430);
    } else if (lane === 3) {
      left = 96 + ((index * 19) % 27);
      top = 326 + ((index * 47) % 430);
    } else {
      const dockLeft = index % 2 === 0;
      left = dockLeft
        ? -4 + ((index * 7) % 14)
        : 90 + ((index * 11) % 14);
      top = 250 + ((index * 17) % 72);
    }

    return {
      asset,
      weak,
      left,
      top,
      width: weak ? 124 + ((index * 17) % 54) : 160 + ((index * 19) % 75),
      rotation: -4.8 + ((index * 23) % 96) / 10,
      z: weak ? 1 + (index % 2) : 3 + (index % 4),
    };
  });

  return field.concat([
    { asset: "rapport-concept-05-brutal", left: 7, top: 468, width: 202, rotation: -1.4, z: 20, overlay: true },
    { asset: "rapport-concept-14-audio", left: 79, top: 494, width: 214, rotation: 1.8, z: 21, overlay: true },
    { asset: "rapport-concept-02-midnight", left: 8, top: 646, width: 220, rotation: 1.2, z: 19, overlay: true },
    { asset: "rapport-concept-15-poster", left: 80, top: 680, width: 196, rotation: -1.7, z: 22, overlay: true },
    { asset: "rapport-concept-13-docs", left: 63, top: -58, width: 180, rotation: -1.1, z: 14, neighbor: true },
    { asset: "rapport-concept-02-midnight", left: 76, top: -50, width: 166, rotation: 1.4, z: 16, neighbor: true },
    { asset: "rapport-concept-10-teal", left: 87, top: -32, width: 152, rotation: -2, z: 13, neighbor: true },
    { asset: "rapport-concept-04-moss", left: 63, top: 74, width: 166, rotation: 1.1, z: 15, neighbor: true },
    { asset: "rapport-concept-15-poster", left: 75, top: 82, width: 184, rotation: -1.6, z: 17, neighbor: true },
    { asset: "rapport-concept-17-cream", left: 89, top: 92, width: 154, rotation: 1.8, z: 14, neighbor: true },
  ]);
}

export function setupHero(reduceMotion: boolean): void {
  const hero = document.querySelector<HTMLElement>(".demo-hook");
  const heroWindow = hero?.querySelector<HTMLElement>(".demo-window");
  const stackRoot = hero?.querySelector<HTMLElement>(".hook-stack");
  if (!hero || !heroWindow || !stackRoot) return;

  const tabs = queryAll<HTMLElement>(heroWindow, ".demo-tab");
  const tiles = queryAll<HTMLElement>(heroWindow, ".variation-tile");
  const scatterSources = queryAll<HTMLElement>(stackRoot, ".hook-card");
  const scatterTemplate = scatterSources[0];
  if (!scatterTemplate) return;

  createScatterSpecs().forEach(
    ({ asset, weak, left, top, width, rotation, z, overlay, neighbor }) => {
      const clone = scatterTemplate.cloneNode(true) as HTMLElement;
      clone.classList.remove("is-visible", "is-rejected", "is-anchor");
      clone.classList.add("is-extra-scatter");
      if (weak) clone.classList.add("is-weak-concept");
      if (overlay) clone.classList.add("is-contrast-overlay");
      if (neighbor) clone.classList.add("is-tagline-neighbor");
      clone.removeAttribute("data-current-design");
      clone.dataset.variantSource = asset;
      clone.style.setProperty("--scatter-left", `${left}%`);
      clone.style.setProperty("--scatter-top", `${top}px`);
      clone.style.setProperty("--scatter-width", `${width}px`);
      clone.style.setProperty("--scatter-top-fluid", `${top / 10}vw`);
      clone.style.setProperty("--scatter-width-fluid", `${width / 10}vw`);
      clone.style.setProperty("--scatter-z", String(z));
      clone.style.setProperty("--rotation", `${rotation}deg`);
      const image = clone.querySelector<HTMLImageElement>("img");
      if (!image) return;
      image.src = `/demo-assets/site-variations/${asset}.jpg`;
      image.alt = "";
      image.decoding = "async";
      stackRoot.append(clone);
    },
  );

  const stack = queryAll<HTMLElement>(hero, ".hook-card");
  const extraCards = stack.filter((card) =>
    card.classList.contains("is-extra-scatter"),
  );
  const rejectedTiles = new Set([0, 7, 10]);

  const finishHero = (): void => {
    tabs.forEach((tab, index) =>
      tab.classList.toggle("is-rejected", rejectedTiles.has(index)),
    );
    tiles.forEach((tile, index) => {
      tile.classList.toggle("is-rejected", rejectedTiles.has(index));
      tile.classList.remove("is-kept");
    });
    stack.forEach((card, index) => {
      card.classList.toggle("is-rejected", index === 7);
      card.classList.toggle("is-anchor", card.hasAttribute("data-current-design"));
    });
    selectVariation(heroWindow, 11);
  };

  const showHeroFinal = (): void => {
    [...tabs, ...tiles, ...stack].forEach((item) =>
      item.classList.add("is-visible"),
    );
    finishHero();
  };

  const playHero = (): void => {
    tabs.forEach((tab, index) =>
      later(() => {
        tab.classList.add("is-visible");
        tiles[index]?.classList.add("is-visible");
        selectVariation(heroWindow, index);
        stack[index]?.classList.add("is-visible");
      }, 160 + index * 150),
    );
    extraCards.forEach((card, index) =>
      later(() => card.classList.add("is-visible"), 220 + index * 28),
    );
    later(finishHero, 2450);
  };

  const selectHeroVariation = (index: number, controlType: "tab" | "tile"): void => {
    selectVariation(heroWindow, index);
    posthogClient?.capture("hero_variation_selected", {
      variation_index: index,
      control_type: controlType,
    });
  };

  tabs.forEach((tab, index) =>
    tab.addEventListener("click", () => selectHeroVariation(index, "tab")),
  );
  tiles.forEach((tile, index) =>
    tile.addEventListener("click", () => selectHeroVariation(index, "tile")),
  );

  if (reduceMotion) {
    showHeroFinal();
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        playHero();
      },
      { threshold: 0.18 },
    );
    observer.observe(hero);
  }

  setupFeedbackDemo(heroWindow, reduceMotion);
}
