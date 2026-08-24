import tailwindcss from "@tailwindcss/vite";
import { defineConfig, type Plugin } from "vite";

function routePrivacyToApp(request: object): void {
  const mutableRequest = request as { url?: string };

  if (!mutableRequest.url) {
    return;
  }

  const url = new URL(mutableRequest.url, "http://rapport.local");
  if (url.pathname === "/privacy" || url.pathname === "/privacy/") {
    mutableRequest.url = `/index.html${url.search}`;
  }
}

const privacyAppRoute: Plugin = {
  name: "rapport-privacy-app-route",
  configureServer(server) {
    server.middlewares.use((request, _response, next) => {
      routePrivacyToApp(request);
      next();
    });
  },
  configurePreviewServer(server) {
    server.middlewares.use((request, _response, next) => {
      routePrivacyToApp(request);
      next();
    });
  },
};

export default defineConfig({
  plugins: [privacyAppRoute, tailwindcss()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
