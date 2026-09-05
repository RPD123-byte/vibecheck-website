import { Agentation } from "agentation";
import { createElement } from "react";
import { createRoot } from "react-dom/client";

export function mountAgentation(): void {
  const mountPoint = document.createElement("div");
  mountPoint.dataset.agentationRoot = "";
  document.body.append(mountPoint);

  createRoot(mountPoint).render(createElement(Agentation));
}
