import {defineConfig} from 'vite';
import motionCanvasPlugin from '@motion-canvas/vite-plugin';

// the plugin ships CJS, so unwrap the interop default
const motionCanvas: typeof motionCanvasPlugin =
  (motionCanvasPlugin as any).default ?? motionCanvasPlugin;

export default defineConfig({
  plugins: [motionCanvas()],
});
