import {Circle, Gradient, Node, Path, makeScene2D} from '@motion-canvas/2d';
import {createSignal, linear} from '@motion-canvas/core';

import {
  FLAP,
  SPAN,
  beakPath,
  bob,
  feetPath,
  footSway,
  headPath,
  torsoPath,
  wingPath,
} from '../bird-geometry';

const CREAM = '#FBF6E7';
const RUST = '#9E3D10';
const EMBER = '#D9701E';
const BUTTER = '#E8A93C';
const CLAW = '#C9752E';
const INK = '#2B1408';

const BEATS = 16;

export default makeScene2D(function* (view) {
  view.fill(CREAM);

  // the only state in the whole animation
  const phase = createSignal(0);

  const wingFill = (side: number) =>
    new Gradient({
      type: 'linear',
      from: [side * 38, -26],
      to: [side * SPAN, -30],
      stops: [
        {offset: 0, color: RUST},
        {offset: 1, color: EMBER},
      ],
    });

  view.add(
    <Node
      scale={2.1}
      y={() => bob(phase())}
      rotation={() => (Math.sin(phase() * 0.5) * 0.03 * 180) / Math.PI}
    >
      <Path data={() => wingPath(-1, phase())} fill={wingFill(-1)} />
      <Path data={() => wingPath(1, phase())} fill={wingFill(1)} />

      <Node rotation={() => footSway(phase())}>
        <Path data={feetPath()} fill={CLAW} />
      </Node>
      <Path data={torsoPath()} fill={RUST} />
      <Path data={headPath()} fill={RUST} />
      <Path data={beakPath()} fill={BUTTER} />

      {/* the face. blinks, because a bird that never blinks is a logo. */}
      <Circle x={-19} y={-74} size={19} fill={INK} />
      <Circle x={19} y={-74} size={19} fill={INK} />
      <Circle x={-15} y={-78} size={6} fill={CREAM} />
      <Circle x={23} y={-78} size={6} fill={CREAM} />
    </Node>,
  );

  // one linear sweep of the phase; every shape is derived from it
  yield* phase(Math.PI * 2 * BEATS, BEATS / FLAP, linear);
});
