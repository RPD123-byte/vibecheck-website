# bird-motion

One starling, flapping. Written as a program in [Motion Canvas](https://motioncanvas.io)
(TypeScript, generator-based timelines) rather than drawn as keyframes.

```bash
npm install          # once
npm start            # editor at http://localhost:9010
```

The editor's render button writes a PNG sequence to `output/`.

## How it works

There is exactly one piece of state — `phase`, in radians — and every shape in
the frame is a pure function of it. The scene body is a single tween:

```ts
yield* phase(Math.PI * 2 * BEATS, BEATS / FLAP, linear);
```

Nothing else is animated. No keyframes, no per-frame poses.

- `src/bird-geometry.ts` — the bird as maths. `wingPath(side, phase)` returns an
  SVG path; the body parts (`tailPath`, `torsoPath`, `headPath`, `beakPath`,
  `speckPath`) are static; `bob(phase)` lifts the body.
- `src/scenes/bird.tsx` — the paths, plus four circles for the face, all fed by
  the phase signal.

She's a common starling seen head-on: round, neckless, short-tailed, pale
flecks, and the yellow dagger beak that gives the species away.

Three details do the work:

1. **Tip lag** (`LAG`) — the wingtip trails the shoulder by 0.9rad, so the tip
   is still finishing the downstroke as the shoulder starts to recover. This is
   the difference between a bird and a pair of scissors.
2. **Foreshortening** — the span shortens as the wings swing out of the picture
   plane, widest at mid-stroke.
3. **Body coupling** — the torso lifts on the downstroke and sinks on the
   recovery, out of phase with the wings.

## Gotchas worth keeping

- The Vite plugin ships CJS, so `vite.config.ts` unwraps the interop default.
  Importing it directly gives `motionCanvas is not a function`.
- Motion Canvas centres a `Path` on the bounding box of its own data. A path
  that changes shape every frame drifts around its own origin, so
  `bird-geometry.ts` prefixes every path with a fixed invisible `ANCHOR` frame
  to pin the box.
- Overlapping subpaths inside a single `Path` cancel under the even-odd fill
  rule. Putting the tail and torso in one path punched a cream hole through the
  belly; body parts are separate nodes for that reason.

## Tuning

`FLAP` (beats/sec) and `LAG` in `src/bird-geometry.ts`; colours in
`src/scenes/bird.tsx`.
