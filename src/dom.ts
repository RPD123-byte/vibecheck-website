export type Timer = ReturnType<typeof setTimeout>;

export function later(callback: () => void, delay: number): Timer {
  return setTimeout(callback, delay);
}

export function queryAll<T extends Element>(
  root: ParentNode,
  selector: string,
): T[] {
  return [...root.querySelectorAll<T>(selector)];
}

export function selectVariation(root: ParentNode, index: number): void {
  queryAll<HTMLElement>(root, ".demo-tab").forEach((tab, itemIndex) => {
    tab.setAttribute("aria-selected", String(itemIndex === index));
  });

  queryAll<HTMLElement>(root, ".variation-tile").forEach(
    (tile, itemIndex) => {
      tile.classList.toggle("is-selected", itemIndex === index);
    },
  );
}
