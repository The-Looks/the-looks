import { memo } from 'react';

const lanes = ['-8%', '17%', '42%', '67%', '92%'] as const;
const garments = ['blazer', 'bag', 'dress', 'blouse', 'sneaker', 'trousers'] as const;

/** Garment cards travel in one direction and restart only after leaving the screen. */
export const AuthMotionBackground = memo(function AuthMotionBackground() {
  return <div className="login-motion-wall" aria-hidden="true">
    {lanes.flatMap((left, lane) => {
      const duration = 39 + lane * 2;
      return [0, 1, 2].map((phase) => (
        <span
          key={`${lane}-${phase}`}
          className={`auth-fashion-item auth-fashion-item--${garments[(lane * 3 + phase) % garments.length]}`}
          data-lane={lane}
          style={{ left, animationDuration: `${duration}s`, animationDelay: `-${(phase * duration / 3 + lane * 2) % duration}s` }}
        />
      ));
    })}
  </div>;
});
