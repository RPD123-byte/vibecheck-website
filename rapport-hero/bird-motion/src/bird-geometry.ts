/**
 * The bird, as maths.
 *
 * A common starling, seen head-on: round, short-tailed, top-heavy, with a
 * yellow dagger of a beak. Everything below is a pure function of one number —
 * the flap phase. Nothing is keyframed by hand.
 */

/** Half-span of the wings, in scene units. Short, because she is chubby. */
export const SPAN = 190;

/**
 * Radians by which the wingtip trails the shoulder. This lag is the entire
 * difference between a bird and a pair of scissors: the tip is still
 * finishing the downstroke while the shoulder has started to recover.
 */
export const LAG = 0.9;

/** Wingbeats per second. */
export const FLAP = 2.6;

/**
 * A fixed, invisible bounding frame.
 *
 * Motion Canvas centres a Path on the bounding box of its own data, so a path
 * that changes shape every frame would drift around its own origin. Two
 * zero-length subpaths at fixed extremes pin the box so the bird stays put.
 */
const ANCHOR = 'M-420 -320L-420 -320M420 320L420 320';

const K = 0.5523; // circular arc → cubic bezier
const r = (n: number) => n.toFixed(2);

/** An ellipse, as four cubic segments. */
function ellipse(cx: number, cy: number, rx: number, ry: number): string {
  const ox = rx * K;
  const oy = ry * K;
  return (
    `M${r(cx)} ${r(cy - ry)}` +
    `C${r(cx + ox)} ${r(cy - ry)} ${r(cx + rx)} ${r(cy - oy)} ${r(cx + rx)} ${r(cy)}` +
    `C${r(cx + rx)} ${r(cy + oy)} ${r(cx + ox)} ${r(cy + ry)} ${r(cx)} ${r(cy + ry)}` +
    `C${r(cx - ox)} ${r(cy + ry)} ${r(cx - rx)} ${r(cy + oy)} ${r(cx - rx)} ${r(cy)}` +
    `C${r(cx - rx)} ${r(cy - oy)} ${r(cx - ox)} ${r(cy - ry)} ${r(cx)} ${r(cy - ry)}Z`
  );
}

/**
 * One wing — short and broad, rounded at the tip.
 *
 * @param side  -1 for her left, 1 for her right
 * @param phase the flap phase, in radians
 */
export function wingPath(side: number, phase: number): string {
  const a = Math.sin(phase);        // shoulder angle
  const b = Math.sin(phase - LAG);  // tip angle, lagging behind
  const curl = (a - b) * 0.35;      // the wing bends under its own load

  const rootX = side * 38;
  const rootY = -26;

  // the span shortens as the wing swings out of the picture plane
  const span = SPAN * (0.6 + 0.4 * Math.cos(b * 0.8));
  const tipX = side * span;
  const tipY = -Math.sin(b) * SPAN * 0.66 - 4;

  const lead1X = side * span * 0.44;
  const lead1Y = rootY - a * SPAN * 0.22 - 30;
  const lead2X = side * span * 0.88;
  const lead2Y = tipY - 24 + curl * 34;

  const trail1X = side * span * 0.68;
  const trail1Y = tipY + 40 + curl * 44;
  const trail2X = side * span * 0.36;
  const trail2Y = rootY - a * SPAN * 0.08 + 62;

  return (
    ANCHOR +
    `M${r(rootX)} ${r(rootY)}` +
    `C${r(lead1X)} ${r(lead1Y)} ${r(lead2X)} ${r(lead2Y)} ${r(tipX)} ${r(tipY)}` +
    `C${r(trail1X)} ${r(trail1Y)} ${r(trail2X)} ${r(trail2Y)} ` +
    `${r(rootX - side * 10)} ${r(rootY + 66)}Z`
  );
}

/*
 * Body parts are separate paths on purpose. Overlapping subpaths inside one
 * path cancel out under the even-odd fill rule — the tail punched a hole
 * through the belly the first time round.
 */

/**
 * Feet, tucked up under the belly the way a bird carries them in flight.
 * Drawn before the torso so the legs disappear into the body.
 */
export function feetPath(): string {
  const foot = (cx: number) =>
    // leg
    `M${r(cx - 5)} 46L${r(cx + 5)} 46L${r(cx + 4)} 90L${r(cx - 4)} 90Z` +
    // three toes, fanned
    `M${r(cx - 2)} 84L${r(cx - 17)} 98L${r(cx - 12)} 102L${r(cx + 2)} 89Z` +
    `M${r(cx - 4)} 86L${r(cx - 2)} 107L${r(cx + 3)} 106L${r(cx + 4)} 86Z` +
    `M${r(cx + 2)} 84L${r(cx + 17)} 98L${r(cx + 12)} 102L${r(cx - 2)} 89Z`;
  return ANCHOR + foot(-24) + foot(24);
}

/** Round torso. */
export function torsoPath(): string {
  return ANCHOR + ellipse(0, 16, 64, 72);
}

/** Round head, sunk into the shoulders — starlings have no visible neck. */
export function headPath(): string {
  return ANCHOR + ellipse(0, -60, 45, 42);
}

/** The beak: short, sharp, and yellow — the giveaway that she's a starling. */
export function beakPath(): string {
  return ANCHOR + 'M-11 -66L11 -66L0 -30Z';
}

/** The feet swing a little behind the body, like anything hanging. */
export function footSway(phase: number): number {
  return Math.sin(phase - 2.4) * 2.4;
}

/** The body lifts on the downstroke and sinks on the recovery. */
export function bob(phase: number): number {
  return -Math.sin(phase - 1.6) * 14;
}
