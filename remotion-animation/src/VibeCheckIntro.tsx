import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const BG = '#FDFBF7';

const EMOJIS = ['😠', '😲', '🤢', '😄'];

const SIZE = 300;
const SPACING = 380;

export const VibeCheckIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();

  const cx = width / 2;
  const cy = height / 2;

  // Phase timings (frames @ 30fps, ~9s total)
  const FALL_STAGGER = 12;
  const FALL_DURATION = 70;
  const ROLL_START = 130;
  const ROLL_END = 195;
  const HOLY_START = 192;
  const RISE_START = 215;
  const RISE_END = 270;

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

  const riseY = interpolate(frame, [RISE_START, RISE_END], [0, -320], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });
  const riseOpacity = interpolate(frame, [RISE_START + 10, RISE_END - 6], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{backgroundColor: BG}}>
      {EMOJIS.map((emoji, i) => {
        // Slow fall from above the top of the frame, with a soft settle
        const fall = spring({
          frame: frame - i * FALL_STAGGER,
          fps,
          durationInFrames: FALL_DURATION,
          config: {damping: 14, stiffness: 30, mass: 1.4},
        });
        const baseX = cx + (i - 1.5) * SPACING;
        const x = baseX + (cx - baseX) * rollProgress;
        // Spin like a ball rolling toward the center
        const rollRotation = rollProgress * ((cx - baseX) / SIZE) * 360;
        const fallY = (1 - fall) * -(cy + SIZE);
        const fadeIntoOne = interpolate(rollProgress, [0.78, 1], [1, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        const wobble =
          rollProgress === 0 && fall > 0.97
            ? Math.sin((frame + i * 14) / 12) * 8
            : 0;
        return (
          <div
            key={emoji}
            style={{
              position: 'absolute',
              left: x - SIZE / 2,
              top: cy - SIZE / 2 + fallY + wobble,
              width: SIZE,
              height: SIZE,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: SIZE * 0.9,
              lineHeight: 1,
              transform: `rotate(${rollRotation}deg)`,
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
          left: cx - SIZE / 2,
          top: cy - SIZE / 2 + riseY,
          width: SIZE,
          height: SIZE,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: SIZE * 0.9,
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
