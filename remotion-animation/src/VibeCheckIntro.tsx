import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const BG = '#FDFBF7';

const EMOJIS = ['😠', '😲', '🤢', '😄'];
const COUNT = 44;

// Phase timings (frames @ 30fps, 10s total)
const ROLL_START = 165;
const ROLL_END = 225;
const HOLY_START = 222;
const RISE_START = 245;
const RISE_END = 295;

export const VibeCheckIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();

  const cx = width / 2;
  const cy = height / 2;

  const rollProgress = interpolate(frame, [ROLL_START, ROLL_END], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });

  const holyPop = spring({
    frame: frame - HOLY_START,
    fps,
    config: {damping: 11, stiffness: 80},
  });

  const riseY = interpolate(frame, [RISE_START, RISE_END], [0, -340], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });
  const riseOpacity = interpolate(
    frame,
    [RISE_START + 10, RISE_END - 6],
    [1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
  );

  return (
    <AbsoluteFill style={{backgroundColor: BG}}>
      {Array.from({length: COUNT}, (_, i) => {
        const emoji = EMOJIS[i % EMOJIS.length];
        const size = 90 + random(`size-${i}`) * 190;
        const startX = random(`x-${i}`) * width;
        const targetY = random(`y-${i}`) * height;
        const delay = random(`delay-${i}`) * 100;
        const fallFrames = 80 + random(`dur-${i}`) * 50;
        const spinSpeed = (random(`spin-${i}`) - 0.5) * 6;
        const drift = (random(`drift-${i}`) - 0.5) * 220;

        // Slow tumble down from above the viewport to a scattered resting spot
        const fall = interpolate(frame, [delay, delay + fallFrames], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: Easing.out(Easing.quad),
        });
        const fallY = -size + (targetY + size) * fall;
        const fallX = startX + drift * fall;

        // Roll together into the center
        const x = fallX + (cx - fallX) * rollProgress;
        const y = fallY + (cy - fallY) * rollProgress;
        const scale = 1 - rollProgress * 0.45;
        const fadeIntoOne = interpolate(rollProgress, [0.8, 1], [1, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        const rotation =
          frame * spinSpeed + rollProgress * 540 * Math.sign(cx - fallX);

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x - size / 2,
              top: y - size / 2,
              width: size,
              height: size,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: size * 0.92,
              lineHeight: 1,
              transform: `rotate(${rotation}deg) scale(${scale})`,
              opacity: fadeIntoOne,
            }}
          >
            {emoji}
          </div>
        );
      })}

      {/* Holy emoji: emerges from the merged pile, rises and fades */}
      <div
        style={{
          position: 'absolute',
          left: cx - 160,
          top: cy - 160 + riseY,
          width: 320,
          height: 320,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 290,
          lineHeight: 1,
          transform: `scale(${holyPop})`,
          opacity: frame < HOLY_START ? 0 : riseOpacity,
        }}
      >
        😇
      </div>
    </AbsoluteFill>
  );
};
